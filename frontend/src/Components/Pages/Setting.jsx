import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  User,
  HelpCircle,
  Trash2,
  ChevronRight,
  X,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { CONTACT_CONFIG } from "../../Contants/Config";
import { getApiBase } from "../../lib/apiBase.js";

const API = getApiBase();

const PageLoader = () => (
  <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white">
    <Loader2 className="w-12 h-12 animate-spin text-[#ff4f1d] mb-4" />
    <p className="font-semibold text-xs tracking-widest uppercase text-gray-500 animate-pulse">
      Loading Settings...
    </p>
  </div>
);

const SettingRow = ({ icon: Icon, title, description, onClick, danger }) => (
  <div
    onClick={onClick}
    className="flex items-center justify-between p-5 rounded-3xl cursor-pointer transition-all duration-300 bg-white border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 active:scale-[0.98]"
  >
    <div className="flex items-center gap-4">
      <div
        className={`p-3 rounded-2xl transition-all duration-300 ${
          danger ? "bg-red-50" : "bg-gray-50"
        }`}
      >
        <Icon size={20} color={danger ? "#ef4444" : "#ff4f1d"} />
      </div>

      <div>
        <h3
          className={`font-bold text-[15px] ${
            danger ? "text-red-600" : "text-gray-900"
          }`}
        >
          {title}
        </h3>
        {description && (
          <p className="text-xs text-gray-400 mt-0.5">{description}</p>
        )}
      </div>
    </div>

    <ChevronRight className="text-gray-300" />
  </div>
);

const SectionOverlay = ({ title, children, onClose }) => (
  <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
    <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-10">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-black text-gray-900">{title}</h2>

        <button
          onClick={onClose}
          className="p-2 rounded-full bg-gray-100  hover:bg-gray-200 hover:text-red-500 transition cursor-pointer hover:scale-110 active:scale-95"
        >
          <X size={18} />
        </button>
      </div>

      {children}
    </div>
  </div>
);

const SettingsPage = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);

  const [userData, setUserData] = useState({
    name: "Loading...",
    email: "",
    phone: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API}/api/public/profile`, {
          withCredentials: true,
        });

        if (res.data && res.data.user) {
          setUserData({
            name: res.data.user.name || "N/A",
            email: res.data.user.email || "N/A",
            phone: res.data.user.phone || "N/A",
          });
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setTimeout(() => setPageLoading(false), 500);
      }
    };
    fetchProfile();
  }, []);

  const handleDeleteAccount = async () => {
    const result = await Swal.fire({
      title: "Delete Account?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${API}/api/public/delete-account`, {
        withCredentials: true,
      });

      localStorage.clear();

      Swal.fire({
        title: "Deleted!",
        text: "Account removed successfully.",
        icon: "success",
        background: "#22c55e",
        color: "#fff",
        showConfirmButton: false,
        timer: 1500,
      });

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Could not delete account.", "error");
    }
  };
  if (pageLoading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-7">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-gray-900">Settings</h1>
          <div className="w-16 h-1 bg-[#ff4f1d] rounded-full mt-2"></div>
        </div>

        <div className="space-y-8">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase mb-4">
              Account
            </p>
            <div className="space-y-3">
              <SettingRow
                icon={User}
                title="Personal Info"
                description="View your profile details"
                onClick={() => setActiveSection("personal")}
              />
              <SettingRow
                icon={HelpCircle}
                title="Support"
                description="Get help & contact us"
                onClick={() => setActiveSection("help")}
              />
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-red-400 uppercase mb-4">
              Danger Zone
            </p>
            <SettingRow
              icon={Trash2}
              title="Delete Account"
              description="Permanently remove your account"
              danger
              onClick={handleDeleteAccount}
            />
          </div>
        </div>

        {activeSection === "personal" && (
          <SectionOverlay
            title="Personal Info"
            onClose={() => setActiveSection(null)}
          >
            <div className="space-y-3">
              {[
                ["Name", userData.name],
                ["Email", userData.email],
                ["Phone", userData.phone],
              ].map(([label, value], i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-gray-50 border border-gray-100"
                >
                  <p className="text-[11px] text-gray-400 uppercase font-bold">
                    {label}
                  </p>
                  <p className="text-sm font-semibold text-gray-900 break-all">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </SectionOverlay>
        )}

        {activeSection === "help" && (
          <SectionOverlay
            title="Support"
            onClose={() => setActiveSection(null)}
          >
            <div className="text-center">
              <HelpCircle className="mx-auto text-[#ff4f1d] w-12 h-12 mb-4" />
              <p className="text-sm text-gray-500 mb-6">
                Need help? Contact our support team anytime.
              </p>
              <button
                title="Contact With Whatapp"
                onClick={() =>
                  window.open(
                    `https://wa.me/${CONTACT_CONFIG.whatsappNumber}`,
                    "_blank",
                  )
                }
                className="w-full p-4 rounded-2xl font-bold text-white bg-[#ff4f1d] hover:bg-[#ff4f1d]/90 transition-all cursor-pointer hover:scale-[1.02] active:scale-95 shadow-lg shadow-[#ff4f1d]/20"
              >
                Contact Us
              </button>
            </div>
          </SectionOverlay>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
