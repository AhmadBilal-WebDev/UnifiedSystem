import React, { useState, useEffect } from "react";
import {
  MapPin,
  LayoutDashboard,
  ShoppingCart,
  History,
  LogOut,
  X,
  Users,
  ShieldCheck,
} from "lucide-react";
import { MdOutlineMenuBook } from "react-icons/md";
import { logImg } from "../../../Contants/Config";

export const Sidebar = ({
  activeTab,
  setActiveTab,
  onLogout,
  isOpen,
  setIsOpen,
}) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [userPermissions, setUserPermissions] = useState([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(true);
  const [profileLabel, setProfileLabel] = useState("Branch Admin");

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("adminUser");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed.accountType === "branch" || parsed.role === "superadmin") {
          setIsSuperAdmin(true);
          setProfileLabel(parsed.branchName || parsed.name || "Main Admin");
        } else {
          setUserPermissions(parsed.permissions || []);
          setIsSuperAdmin(false);
          setProfileLabel(parsed.branchName || parsed.name || "Staff Member");
        }
      }
    } catch (e) {
      console.error("Error reading permissions:", e);
    }
  }, []);

  const allMenuItems = [
    {
      id: "dashboard",
      label: "System Overview",
      icon: LayoutDashboard,
      gate: "viewDashboard",
    },
    { id: "areas", label: "Area Management", icon: MapPin, gate: "viewDashboard" },
    {
      id: "roles",
      label: "Role Management",
      icon: ShieldCheck,
      gate: "viewRoles",
    },
    {
      id: "menu",
      label: "Product Inventory",
      icon: MdOutlineMenuBook,
      gate: "viewMenu",
    },
    {
      id: "orders",
      label: "Order Mangement",
      icon: ShoppingCart,
      gate: "viewOrders",
    },
    { id: "users", label: "Register Customer", icon: Users, gate: "viewUsers" },
    {
      id: "history",
      label: "Activity Tracking",
      icon: History,
      gate: "viewHistory",
    },
  ];

  const allowedMenuItems = allMenuItems.filter((item) => {
    if (isSuperAdmin) return true;
    if (item.id === "orders")
      return (
        userPermissions.includes("viewOrders") ||
        userPermissions.includes("acceptOrders")
      );
    return userPermissions.includes(item.gate);
  });

  return (
    <>
      <div
        className={`w-64 h-screen bg-[#0b0f19] border-r border-slate-700 flex flex-col fixed left-0 top-0 z-40 transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="p-6 border-b border-slate-700 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600/10 flex items-center justify-center rounded-2xl border border-slate-700 shadow-lg shadow-blue-900/10 shrink-0">
              <ShieldCheck size={20} className="text-blue-500" />
            </div>
            <span className="text-white font-black text-sm tracking-wide">
              Admin Panel
            </span>
          </div>

          <button
            title="Close"
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 md:hidden cursor-pointer hover:bg-slate-700"
          >
            <X size={20} />
          </button>
        </div>
        <nav
          className="flex-1 px-4 mt-4 space-y-1 overflow-y-auto pr-2"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#475569 #0b0f19",
          }}
        >
          {allowedMenuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                title={item.label}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`w-full cursor-pointer flex items-center gap-3 px-8 py-3 rounded-2xl font-bold transition-all duration-300 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                    : "text-slate-500 hover:bg-slate-800/50 hover:text-white"
                }`}
              >
                <item.icon size={20} />
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-slate-800">
          <div className="mb-3">
            <p className="text-[10px] text-center  text-slate-500 uppercase tracking-wider font-bold">
              {isSuperAdmin ? "Administrator" : "Staff Member"}
            </p>
          </div>
          <button
            title="Logout"
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-rose-500/20 hover:bg-rose-700/20 text-rose-500 hover:text-rose-600 rounded-2xl font-bold transition-all cursor-pointer text-sm border border-rose-500/30 hover:border-rose-600/30"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>

      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0b0f19]/80 backdrop-blur-md">
          <div className="bg-[#131b2e] border border-slate-800 rounded-3xl max-w-sm w-full p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mb-6">
                <LogOut size={32} />
              </div>
              <h3 className="text-xl font-black text-white mb-2">
                Confirm Sign Out
              </h3>
              <p className="text-sm text-slate-400 mb-8">
                Are you sure you want to exit your dashboard?
              </p>
              <div className="grid grid-cols-2 gap-3 w-full">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="px-4 py-3 bg-slate-800 text-slate-300 rounded-2xl font-bold text-sm hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowLogoutModal(false);
                    onLogout();
                  }}
                  className="px-4 py-3 bg-rose-500 text-white rounded-2xl font-bold text-sm hover:bg-rose-600 shadow-lg shadow-rose-900/20 cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
