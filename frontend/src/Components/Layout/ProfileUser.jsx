import React, { useState } from "react";
import ReactDOM from "react-dom"; // Portal ke liye import kiya
import { Link, useLocation } from "react-router-dom";
import { X } from "lucide-react";
import { FaUserCircle, FaChevronDown } from "react-icons/fa";
import { MdLogout } from "react-icons/md";
import { title_name, profileMenuConfig, logImg } from "../../Contants/Config";

// ================= REUSABLE LOGOUT MODAL (PORTAL FIXED - EXACT CENTER) =================
const LogoutModal = ({ onClose, onConfirm }) => {
  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{
        zIndex: 9999999,
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm"
        style={{
          width: "100vw",
          height: "100vh",
          position: "fixed",
          top: 0,
          left: 0,
        }}
        onClick={onClose}
      ></div>

      {/* Exact Center Popup Box */}
      <div
        className="relative bg-white rounded-[2.5rem] p-6 md:p-8 w-full max-w-[340px] text-center shadow-[0_25px_70px_rgba(0,0,0,0.45)] border-4 border-white z-[10000000]"
        style={{
          animation:
            "popupZoomIn 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
        }}
      >
        <div className="flex flex-col items-center mb-4">
          <div
            className="p-3 rounded-full mb-2 shadow-inner flex items-center justify-center"
            style={{ backgroundColor: "var(--profile-primary, #f97316)" }}
          >
            <img
              src={logImg.img}
              alt={logImg.altName}
              className="w-12 h-12 object-contain"
            />
          </div>
        </div>

        <p className="text-gray-500 font-bold text-sm mb-6 px-2 uppercase italic leading-relaxed">
          Are you sure you want to logout from <br />
          <span
            style={{ color: "var(--profile-primary, #f97316)" }}
            className="font-black"
          >
            Delight Crust
          </span>
          ?
        </p>

        <div className="flex flex-col gap-2.5">
          <button
            title="Logout"
            onClick={onConfirm}
            className="w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-widest shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer text-white"
            style={{ backgroundColor: "var(--profile-primary, #f97316)" }}
          >
            Confirm Logout
          </button>
          <button
            onClick={onClose}
            className="w-full py-3.5 bg-gray-100 text-gray-500 rounded-xl font-black text-sm uppercase tracking-widest transition-all hover:bg-gray-200 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>

      <style>{`
        @keyframes popupZoomIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>,
    document.body,
  );
};

// ================= MOBILE PROFILE =================
export const MobileProfile = ({
  user,
  handleLogout,
  setOpenMenu,
  setShowAuthModal,
}) => {
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  return (
    <>
      <div className="flex flex-col w-full h-full bg-[var(--profilemenu-primary)]">
        <div
          className="px-5 pt-5 pb-5 flex justify-between items-center border-b border-black/10 shadow-sm"
          style={{ backgroundColor: "var(--profilemenu-primary)" }}
        >
          <h3 className="font-black italic uppercase text-xl tracking-tighter leading-none text-white">
            {user
              ? `Hi, ${user?.name?.split(" ")[0]}`
              : `${title_name.firstName} ${title_name.secondName}`}
          </h3>
          <button
            onClick={() => setOpenMenu(false)}
            className="p-2 bg-white/20 rounded-full text-white cursor-pointer hover:bg-white/30"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto py-10">
          <nav className="flex flex-col space-y-4 px-3">
            {user ? (
              profileMenuConfig.map((item, idx) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;

                return (
                  <Link
                    key={idx}
                    to={item.to}
                    onClick={() => setOpenMenu(false)}
                    className={`relative flex items-center justify-center gap-4 px-5 py-4 rounded-xl transition-all font-semibold text-lg cursor-pointer hover:shadow-md active:scale-95
                      ${
                        isActive
                          ? "bg-[var(--accent-white)] text-red-900 shadow-xl"
                          : "text-white/90 hover:bg-white/5"
                      }`}
                  >
                    <Icon size={25} />
                    <span>{item.label}</span>
                  </Link>
                );
              })
            ) : (
              <button
                onClick={() => {
                  setOpenMenu(false);
                  if (setShowAuthModal) setShowAuthModal(true);
                }}
                className="w-full py-4 bg-white text-red-900 rounded-xl font-black text-lg uppercase tracking-wider shadow-xl active:scale-95 cursor-pointer"
              >
                Login / Register
              </button>
            )}
          </nav>
        </div>

        {user && (
          <div className="p-4 border-t border-[var(--border-line)]">
            <button
              title="Logout"
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full flex items-center justify-center gap-4 px-6 py-5 text-[var(--accent-white)] bg-red-500/5 rounded-2xl border border-red-500/20 cursor-pointer hover:bg-red-500/10 active:scale-95 transition-all"
            >
              <MdLogout size={24} className="rotate-180" />
              <span className="font-bold uppercase text-sm tracking-[0.2em]">
                Log Out
              </span>
            </button>
          </div>
        )}
      </div>

      {showLogoutConfirm && (
        <LogoutModal
          onClose={() => setShowLogoutConfirm(false)}
          onConfirm={() => {
            setShowLogoutConfirm(false);
            setOpenMenu(false);
            localStorage.removeItem("userLocation");
            window.dispatchEvent(new Event("locationUpdated"));
            handleLogout();
          }}
        />
      )}
    </>
  );
};

// ================= DESKTOP PROFILE =================
export const DesktopProfile = ({ user, handleLogout, setShowAuthModal }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const location = useLocation();

  return (
    <div
      className="relative"
      onMouseEnter={() => setDropdownOpen(true)}
      onMouseLeave={() => setDropdownOpen(false)}
    >
      <button
        className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-black uppercase italic tracking-tighter text-sm shadow-md hover:shadow-2xl transition-all duration-300 active:scale-95 border-2 border-white cursor-pointer"
        style={{
          backgroundColor: "var(--profilemenu-primary)",
          color: "white",
        }}
      >
        <FaUserCircle size={23} />
        <span className="max-w-[100px] truncate">
          {user?.name?.split(" ")[1]}
        </span>
        <FaChevronDown
          className={`transition-transform duration-500 ${dropdownOpen ? "rotate-180" : ""}`}
          size={10}
        />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-0 pt-4 w-64 z-50 origin-top animate-in fade-in slide-in-from-top-8 duration-300 ease-out">
          <div
            className="relative bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.15)] border-4 border-white p-2 
            before:content-[''] before:absolute before:-top-[15px] before:right-8 before:w-0 before:h-0 before:border-l-[12px] before:border-l-transparent before:border-r-[12px] before:border-r-transparent before:border-b-[12px] before:border-b-gray-100
            after:content-[''] after:absolute after:-top-[10px] after:right-8 after:w-0 after:h-0 after:border-l-[12px] after:border-l-transparent after:border-r-[12px] after:border-r-transparent after:border-b-[12px] after:border-b-white"
          >
            <div className="px-4 text-center py-3 border-b border-gray-100 mb-2 relative z-10">
              <p className="text-[10px] font-black text-gray-400 truncate italic uppercase tracking-widest">
                welcome back, {user?.name?.split(" ")[1]}!
              </p>
            </div>

            <div className="flex flex-col gap-1 relative z-10">
              {profileMenuConfig
                .filter((link) => !link.mobileOnly)
                .map((item, idx) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.to;
                  return (
                    <Link
                      key={idx}
                      to={item.to}
                      onClick={() => setDropdownOpen(false)}
                      className="group flex items-center gap-3 p-3 rounded-xl transition-all font-black uppercase italic text-[11px] tracking-tight cursor-pointer hover:bg-gray-50 hover:pl-5"
                      style={{
                        backgroundColor: isActive
                          ? "var(--profilemenu-input-bg)"
                          : "transparent",
                        color: isActive
                          ? "var(--profilemenu-primary)"
                          : "#4b5563",
                      }}
                    >
                      <Icon
                        size={20}
                        className="transition-transform group-hover:scale-110 group-hover:rotate-6"
                      />
                      {item.label}
                    </Link>
                  );
                })}
            </div>

            <div className="mt-2 pt-2 border-t border-gray-100 relative z-10">
              <button
                title="Confirm Logout"
                onClick={() => {
                  setDropdownOpen(false);
                  setShowLogoutConfirm(true);
                }}
                className="group w-full flex items-center gap-3 p-3 text-red-500 hover:bg-red-50 rounded-xl font-black uppercase italic text-[11px] tracking-widest transition-all cursor-pointer hover:gap-5"
              >
                <MdLogout
                  size={20}
                  className="rotate-180 transition-transform group-hover:-translate-x-1"
                />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {showLogoutConfirm && (
        <LogoutModal
          onClose={() => setShowLogoutConfirm(false)}
          onConfirm={() => {
            setShowLogoutConfirm(false);
            localStorage.removeItem("userLocation");
            window.dispatchEvent(new Event("locationUpdated"));
            handleLogout();
          }}
        />
      )}
    </div>
  );
};
