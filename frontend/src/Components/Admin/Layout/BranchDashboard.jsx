import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import axios from "axios";
import { Menu, ChevronDown, ShieldAlert } from "lucide-react";
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};
import DashboardOverview from "/src/Components/Admin/Dashboard/DashboardView.jsx";
import MenuView from "/src/Components/Admin/Dashboard/MenuView";
import OrdersView from "../Dashboard/OrdersView";
import HistoryView from "../Dashboard/HistoryView";
import RollView from "../Dashboard/RollView";
import AreaManagementView from "../Dashboard/AreaManagement";
import UsersView from "../Dashboard/UsersView";
export function BranchDashboard() {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("adminActiveTab") || "dashboard";
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isBranchOpen, setIsBranchOpen] = useState(false);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState(() => {
    return localStorage.getItem("adminSelectedBranchId") || "";
  });

  const [userPermissions, setUserPermissions] = useState([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("adminUser");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);

        if (parsed.accountType === "branch" || parsed.role === "superadmin") {
          setIsSuperAdmin(true);
          setUserPermissions([]);
        } else if (
          parsed.accountType === "user" ||
          (parsed.permissions && Array.isArray(parsed.permissions))
        ) {
          setUserPermissions(parsed.permissions || []);
          setIsSuperAdmin(false);

          if (parsed.branchId || parsed.branch || parsed.parentBranchId) {
            const assignedBranch =
              parsed.branchId || parsed.branch || parsed.parentBranchId;
            setSelectedBranchId(assignedBranch);
            localStorage.setItem("adminSelectedBranchId", assignedBranch);
          }
        }
      }
    } catch (e) {
      console.error("Error parsing admin user context:", e);
    }
  }, []);

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isSidebarOpen]);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const token =
          getCookie("adminToken") || localStorage.getItem("adminToken");
        if (!token) return;

        if (!localStorage.getItem("adminToken")) {
          localStorage.setItem("adminToken", token);
        }

        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/admin/branches`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        const branchList = Array.isArray(res.data) ? res.data : [];
        setBranches(branchList);

        if (!selectedBranchId && branchList.length > 0) {
          const first = branchList[0]._id;
          setSelectedBranchId(first);
          localStorage.setItem("adminSelectedBranchId", first);
        }
      } catch (error) {
        console.error("Failed to load branches:", error);
      }
    };

    fetchBranches();
  }, [selectedBranchId]);

  useEffect(() => {
    localStorage.setItem("adminActiveTab", activeTab);
  }, [activeTab]);

  const navigate = useNavigate();

  const handleLogout = () => {
    document.cookie =
      "adminToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin/login");
  };

  const getHeaderTitle = () => {
    switch (activeTab) {
      case "dashboard":
        return "Dashboard";
      case "areas":
        return "Locations";
      case "roles":
        return "Permissions";
      case "menu":
        return "Food Menu";
      case "orders":
        return "My Orders";
      case "history":
        return "My History";
      case "users":
        return "User View";
      default:
        return "Dashboard";
    }
  };
  const handleBranchChange = (branchId) => {
    setLoading(true);
    setSelectedBranchId(branchId);
    localStorage.setItem("adminSelectedBranchId", branchId);

    setTimeout(() => setLoading(false), 1000);
    setIsBranchOpen(false);
  };
  const hasPermission = (requiredNode) => {
    if (isSuperAdmin) return true;
    return userPermissions.includes(requiredNode);
  };

  return (
    <div className="flex h-screen w-screen bg-[var(--bg-sidebar)] overflow-hidden">
     {loading && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0b0f19]/90 backdrop-blur-md transition-all duration-300">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>

          <p className="mt-8 text-slate-300 font-bold text-sm tracking-[0.2em] uppercase animate-pulse">
            Switching Branch...
          </p>
        </div>
      )}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col md:pl-60 h-screen overflow-hidden w-full relative">
        <header className="h-20 bg-[#0b0f19] border-b border-slate-600 flex items-center px-3 md:px-23 justify-between shrink-0 w-full z-20">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-slate-400 hover:bg-slate-800 rounded-xl md:hidden cursor-pointer"
          >
            <Menu size={24} />
          </button>

          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight absolute left-1/2 transform -translate-x-1/2 md:static md:transform-none">
            {getHeaderTitle()}
          </h1>

          <div className="relative">
            <div
              className={`flex items-center justify-between gap-3 min-w-[90px] md:min-w-[110px] rounded-2xl border ${
                isSuperAdmin
                  ? "border-slate-700 bg-slate-800/50 hover:border-blue-500/50"
                  : "border-slate-800 bg-slate-900 cursor-not-allowed opacity-60"
              } px-4 py-2.5 text-sm text-slate-300 transition-all duration-300 cursor-pointer`}
              onClick={() => isSuperAdmin && setIsBranchOpen(!isBranchOpen)}
            >
              <span className="truncate font-semibold">
                {branches.find((b) => b._id === selectedBranchId)?.city ||
                  branches.find((b) => b._id === selectedBranchId)
                    ?.branchName ||
                  "Select Branch"}
              </span>
              {isSuperAdmin && (
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-300 ${isBranchOpen ? "rotate-180" : "rotate-0"}`}
                />
              )}
            </div>

            {isBranchOpen && isSuperAdmin && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-[#131b2e] border border-slate-800 rounded-2xl shadow-2xl z-50 p-2 animate-in fade-in zoom-in duration-200">
                {branches.map((branch) => (
                  <div
                    key={branch._id}
                    className="p-3 hover:bg-blue-600/10 hover:text-blue-400 cursor-pointer rounded-xl text-sm text-slate-300 transition-all"
                    onClick={() => handleBranchChange(branch._id)}
                  >
                    {branch.city || branch.branchName || branch._id}
                  </div>
                ))}
              </div>
            )}
          </div>
        </header>

        <main
          className="flex-1  overflow-y-auto w-full"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#475569 #0b0f19",
          }}
        >
          <div className="w-full h-full ">
            {activeTab === "dashboard" && hasPermission("viewDashboard") && (
              <DashboardOverview selectedBranchId={selectedBranchId} />
            )}

            {activeTab === "roles" && hasPermission("viewRoles") && (
              <RollView selectedBranchId={selectedBranchId} />
            )}

            {activeTab === "menu" && hasPermission("viewMenu") && (
              <MenuView selectedBranchId={selectedBranchId} />
            )}

            {activeTab === "orders" &&
              (hasPermission("viewOrders") ||
                hasPermission("acceptOrders") ||
                hasPermission("rejectOrders")) && (
                <OrdersView selectedBranchId={selectedBranchId} />
              )}

            {activeTab === "users" && hasPermission("viewUsers") && (
              <UsersView selectedBranchId={selectedBranchId} />
            )}

            {activeTab === "history" && hasPermission("viewHistory") && (
              <HistoryView selectedBranchId={selectedBranchId} />
            )}
            {activeTab === "areas" && (
              <AreaManagementView selectedBranchId={selectedBranchId} />
            )}
            {!isSuperAdmin &&
              activeTab === "roles" &&
              !userPermissions.includes("viewRoles") && (
                <div className="flex flex-col items-center justify-center min-h-full w-full  text-center bg-[#131b2e]  ">
                  <div className="w-20 h-20 bg-slate-800/50 text-slate-500 rounded-full flex items-center justify-center mb-6 border border-slate-700/50">
                    <ShieldAlert size={40} strokeWidth={1.2} />
                  </div>

                  <h3 className="text-xl font-semibold text-slate-200 ">
                    Access Restricted
                  </h3>
                  <p className="text-slate-500 text-sm p-6 max-w-sm">
                    You do not have permission to view this panel. Please select
                    the appropriate tab to continue.
                  </p>
                </div>
              )}
          </div>
        </main>
      </div>
    </div>
  );
}
