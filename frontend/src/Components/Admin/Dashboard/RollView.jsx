import { getApiBase } from "../../../lib/apiBase.js";
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus,
  Shield,
  Users,
  CheckSquare,
  X,
  Check,
  Edit2,
  UserX,
  UserCheck,
  Loader2,
  Mail,
  ShieldCheck,
  Trash2,
  User,
  Search,
  BarChart2,
  PieChart as PieIcon,
  TrendingUp,
  Eye,
} from "lucide-react";

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

const ALL_PERMISSIONS = [
  { id: "viewDashboard", label: "Dashboard" },
  { id: "viewLocations", label: "Locations" },
  { id: "viewMenu", label: "Food Menu" },
  { id: "viewOrders", label: "Orders Review" },
  { id: "viewUsers", label: "Registered Users" },
  { id: "viewHistory", label: "My History" },
];

export default function RollView({ selectedBranchId }) {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState(null);
  const [staffName, setStaffName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);

  const token = getCookie("adminToken") || localStorage.getItem("adminToken");
  const baseUrl = getApiBase();

  const activeCount = roles.filter((r) => r.status !== "blocked").length;
  const blockedCount = roles.filter((r) => r.status === "blocked").length;
  const totalCount = roles.length || 1;

  const activePercentage = Math.round((activeCount / totalCount) * 100);
  const blockedPercentage = Math.round((blockedCount / totalCount) * 100);

  const permissionDistribution = ALL_PERMISSIONS.map((p) => {
    const count = roles.filter((r) => r.permissions?.includes(p.id)).length;
    return { label: p.label, count };
  });
  const maxDistributionCount = Math.max(
    ...permissionDistribution.map((o) => o.count),
    1,
  );

  const handleViewPermissions = (role) => {
    setSelectedRole(role);
    setIsPermissionModalOpen(true);
  };

  const fetchRoles = async () => {
    if (!selectedBranchId) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `${baseUrl}/admin/branch-user/all/${selectedBranchId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setRoles(res.data?.data || (Array.isArray(res.data) ? res.data : []));
    } catch (err) {
      setError("Failed to load roles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [selectedBranchId]);

  const handleOpenCreateModal = () => {
    setIsEditMode(false);
    setStaffName("");
    setEmail("");
    setPassword("");
    setSelectedPermissions([]);
    setShowModal(true);
  };

  const handleOpenEditModal = (staff) => {
    setIsEditMode(true);
    setEditingStaffId(staff._id);
    setStaffName(
      staff.name || (staff.adminEmail || staff.email)?.split("@")[0],
    );
    setEmail(staff.adminEmail || staff.email);
    setSelectedPermissions(staff.permissions || []);
    setShowModal(true);
  };

  const togglePermission = (id) => {
    setSelectedPermissions((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const handleToggleStatus = async (staffId) => {
    setActionLoading(staffId);
    try {
      const res = await axios.put(
        `${baseUrl}/admin/branch-user/toggle-status/${staffId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.data?.success) fetchRoles();
    } finally {
      setActionLoading(null);
    }
  };

  const confirmDelete = (staffId) => {
    setDeleteConfirm(staffId);
  };

  const performDelete = async () => {
    try {
      await axios.delete(
        `${baseUrl}/admin/branch-user/delete/${deleteConfirm}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setDeleteConfirm(null);
      fetchRoles();
    } catch (err) {
      setError("Delete failed.");
    }
  };

  const handleCreateOrUpdateRole = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await axios.patch(
          `${baseUrl}/admin/branch-user/update-permissions`,
          { staffId: editingStaffId, permissions: selectedPermissions },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      } else {
        await axios.post(
          `${baseUrl}/admin/branch-user/create`,
          {
            branchId: selectedBranchId,
            name: staffName,
            email,
            password,
            role: "admin",
            permissions: selectedPermissions,
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      }
      setShowModal(false);
      fetchRoles();
    } catch (err) {
      setError("Action failed.");
    }
  };

  if (loading)
    return (
      <div className="fixed inset-0 flex flex-col gap-4 justify-center items-center bg-[#0b0f19] z-[9999]">
        <div className="relative">
          <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-blue-500 text-[10px] font-medium tracking-[0.2em] animate-pulse">
            PLEASE WAIT...
          </span>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0b0f19] p-4 md:p-8 space-y-8 text-slate-300 select-none transition-all duration-500">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .animate-fade-in { animation: fadeIn 0.3s ease-out both; }
        .animate-scale-in { animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
      `}</style>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-slate-800/80 pb-6 animate-fade-in-up">
        <div className="flex items-center gap-3.5">
          <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/5 p-3 rounded-2xl border border-blue-500/20 text-blue-400 shadow-lg shadow-blue-950/20 group hover:border-blue-500/40 transition-all duration-300">
            <ShieldCheck size={18} className="animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white tracking-tight">
              Access Management
            </h2>
            <p className="text-xs text-slate-500 font-bold tracking-wider mt-0.5">
              Define & Allocate System Permissions
            </p>
          </div>
        </div>

        <button
          title="Assign New Rolls"
          onClick={handleOpenCreateModal}
          className="bg-blue-600 hover:bg-blue-500 cursor-pointer text-white text-xs font-black px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 shadow-lg shadow-blue-950/50 w-full sm:w-auto cursor-pointer"
        >
          <Plus
            size={15}
            strokeWidth={3}
            className="group-hover:rotate-90 transition-transform duration-300"
          />
          Assign Role
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up [animation-delay:100ms]">
        <div className="bg-[#131b2e] border border-slate-800/60 rounded-3xl p-6 flex flex-col justify-between space-y-6 hover:border-slate-700/60 transition-all duration-300">
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <PieIcon size={14} className="text-indigo-400" /> Account Status
              Matrix
            </h3>
            <p className="text-[11px] text-slate-500">
              Live credential state analysis graph.
            </p>
          </div>

          <div className="flex items-center justify-around gap-4 bg-[#0b0f19]/40 border border-slate-800/60 p-4 rounded-2xl group hover:bg-[#0b0f19]/60 transition-all duration-300">
            <div className="relative w-20 h-20 flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 36 36"
              >
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-500 transition-all stroke-dasharray duration-1000 ease-out"
                  strokeWidth="4"
                  strokeDasharray={`${roles.length > 0 ? activePercentage : 0}, 100`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-sm font-black text-white">
                  {roles.length}
                </span>
                <span className="text-[8px] text-slate-500 font-bold uppercase">
                  Staff
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 shrink-0">
              <div className="bg-[#0b0f19] border border-slate-800/60 px-3 py-1.5 rounded-xl flex items-center gap-2 hover:border-emerald-500/30 transition-colors">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-pulse"></div>
                <div>
                  <p className="text-[9px] text-slate-500 font-bold uppercase">
                    Active Users
                  </p>
                  <p className="text-xs font-black text-white">
                    {activeCount}{" "}
                    <span className="text-[9px] font-normal text-slate-500">
                      ({roles.length > 0 ? activePercentage : 0}%)
                    </span>
                  </p>
                </div>
              </div>
              <div className="bg-[#0b0f19] border border-slate-800/60 px-3 py-1.5 rounded-xl flex items-center gap-2 hover:border-rose-500/30 transition-colors">
                <div className="w-2 h-2 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50"></div>
                <div>
                  <p className="text-[9px] text-slate-500 font-bold uppercase">
                    Suspended
                  </p>
                  <p className="text-xs font-black text-white">
                    {blockedCount}{" "}
                    <span className="text-[9px] font-normal text-slate-500">
                      ({roles.length > 0 ? blockedPercentage : 0}%)
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#0b0f19] border border-slate-800/80 p-3 rounded-2xl flex items-center gap-3 hover:border-indigo-500/30 transition-all duration-300">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                <TrendingUp size={14} />
              </div>
              <div>
                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">
                  Workspace
                </p>
                <h4 className="text-xs font-black text-white truncate max-w-[80px]">
                  {selectedBranchId ? "Live Sync" : "No Branch"}
                </h4>
              </div>
            </div>
            <div className="bg-[#0b0f19] border border-slate-800/80 p-3 rounded-2xl flex items-center gap-3 hover:border-amber-500/30 transition-all duration-300">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <CheckSquare size={14} />
              </div>
              <div>
                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">
                  Modules
                </p>
                <h4 className="text-xs font-black text-white">
                  {ALL_PERMISSIONS.length} Units
                </h4>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#131b2e] border border-slate-800/60 rounded-3xl p-6 lg:col-span-2 flex flex-col justify-between hover:border-slate-700/60 transition-all duration-300">
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <BarChart2 size={14} className="text-blue-400" /> Permission
              Metrics Distribution
            </h3>
            <p className="text-[11px] text-slate-500">
              Real-time load frequency of modules distributed among profile
              structures.
            </p>
          </div>

          <div className="space-y-3 mt-4 cursor-pointer lg:mt-0">
            {permissionDistribution.map((item, index) => {
              const currentBarPercent = Math.round(
                (item.count / maxDistributionCount) * 100,
              );
              return (
                <div key={index} className="flex items-center gap-4 group">
                  <span className="text-[10px] font-bold text-slate-400 w-24 truncate transition-colors group-hover:text-white">
                    {item.label}
                  </span>

                  <div className="flex-1 bg-[#0b0f19] border border-slate-800/80 h-3 rounded-full overflow-hidden p-[2px] relative">
                    <div
                      style={{
                        width: `${roles.length > 0 ? currentBarPercent : 0}%`,
                      }}
                      className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full rounded-full transition-all duration-1000 ease-out shadow-inner shadow-blue-400/20"
                    ></div>
                  </div>

                  <span className="text-[10px] font-black text-slate-500 bg-[#0b0f19] border border-slate-800 px-2 py-0.5 rounded-md min-w-[32px] text-center group-hover:text-blue-400 group-hover:border-blue-500/20 group-hover:scale-105 transition-all duration-200">
                    {item.count} U
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* {roles.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in-up [animation-delay:200ms]">
          {roles.map((r, index) => (
            <div
              key={r._id}
              style={{ animationDelay: `${index * 50}ms` }}
              className="bg-[#131b2e] border border-slate-800/50 hover:border-slate-600 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40 group relative overflow-hidden animate-fade-in-up"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-[#0b0f19] border border-slate-800 p-2.5 rounded-xl text-blue-400 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110 shadow-inner">
                    <User size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm capitalize group-hover:text-blue-400 transition-colors duration-300 truncate max-w-[150px]">
                      {r.adminEmail
                        ? r.adminEmail.split("@")[0]
                        : "Unnamed Staff"}
                    </h4>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1 truncate max-w-[140px] mt-0.5">
                      <Mail size={10} className="text-slate-600 shrink-0" />
                      <span className="truncate">{r.adminEmail}</span>
                    </p>
                  </div>
                </div>

                <div className="flex gap-1 bg-[#0b0f19]/60 border border-slate-800/40 p-1 rounded-xl opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    title="Edit Your Role"
                    onClick={() => handleOpenEditModal(r)}
                    className="p-1.5 cursor-pointer text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all active:scale-90"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    title="Delete Your Role"
                    onClick={() => confirmDelete(r._id)}
                    className="p-1.5 text-slate-400 cursor-pointer hover:text-rose-400 hover:bg-rose-950/20 rounded-lg transition-all active:scale-90"
                  >
                    <Trash2 size={13} />
                  </button>
                  <div className="w-[1px] h-4 bg-slate-800 mx-0.5 self-center"></div>
                  <button
                    title="Actionable Label"
                    onClick={() => handleToggleStatus(r._id)}
                    className={`flex flex-col items-center cursor-pointer justify-center p-1 rounded-lg transition-all duration-200 min-w-[32px] active:scale-90 ${
                      r.status === "blocked"
                        ? "text-rose-500 hover:bg-rose-950/10"
                        : "text-emerald-500 hover:bg-emerald-950/10"
                    }`}
                  >
                    {actionLoading === r._id ? (
                      <Loader2
                        size={14}
                        className="animate-spin text-slate-500"
                      />
                    ) : r.status === "blocked" ? (
                      <UserX size={14} className="animate-pulse" />
                    ) : (
                      <UserCheck size={14} />
                    )}
                    <span className="text-[7px] font-black uppercase mt-0.5 scale-90 tracking-wide">
                      {r.status === "blocked" ? "Block" : "Live"}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-slate-800/50">
                {r.permissions && r.permissions.length > 0 ? (
                  r.permissions.map((p, i) => (
                    <span
                      key={i}
                      className="text-[9px]  text-white border border-slate-800/80 px-2 py-0.5 rounded-md uppercase font-black  group-hover:border-blue-500/30 transition-all duration-300"
                    >
                      {p.replace("view", "")}
                    </span>
                  ))
                ) : (
                  <span className="text-[9px] text-slate-600 italic">
                    No access parameters allowed
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-slate-800 rounded-3xl bg-[#0b0f19]/50 animate-scale-in">
          <div className="w-20 h-20 bg-blue-600/10 rounded-full flex items-center justify-center mb-6 relative">
            <Search size={32} className="text-blue-500 animate-bounce" />
            <div className="absolute inset-0 border-2 border-blue-500/20 rounded-full animate-ping"></div>
          </div>
          <h3 className="text-xl font-black text-white mb-2">No Roles Found</h3>
          <p className="text-slate-500 text-sm max-w-xs mb-8">
           System role not found. Click below to create a new role.
          </p>
          <button
          title="New Create Roll"
            onClick={handleOpenCreateModal}
            className="bg-blue-600 hover:bg-blue-500 text-sm text-white font-bold px-5 py-3 rounded-2xl flex items-center gap-2 transition-all active:scale-95 cursor-pointer shadow-lg shadow-blue-950/40"
          >
            <Plus size={16} /> Create New Role
          </button>
        </div>
      )} */}

      {roles.length > 0 ? (
        <div className="bg-[#131b2e]/40 border border-slate-900 rounded-2xl overflow-hidden backdrop-blur-md shadow-xl shadow-black/20 animate-fade-in-up [animation-delay:200ms]">
          <div className="overflow-x-auto custom-scrollbar">
            <div className="min-w-[900px] p-5 space-y-2.5">
              {/* Table Headers */}
              <div className="grid grid-cols-12 px-6 py-3.5 text-[10px] uppercase font-bold tracking-widest text-slate-500 bg-slate-950/20 rounded-xl mb-1.5 items-center">
                <div className="col-span-3">Staff Profile</div>
                <div className="col-span-3">Contact Context</div>
                <div className="col-span-3">Access Parameters</div>
                <div className="col-span-3 text-right pr-4">
                  Action Controls
                </div>
              </div>

              {/* Dynamic Data Rows */}
              {roles.map((r, index) => {
                const isBlocked = r.status === "blocked";

                return (
                  <div
                    key={r._id}
                    style={{ animationDelay: `${index * 50}ms` }}
                    className="grid grid-cols-12 items-center px-6 py-3 bg-slate-950/30 hover:bg-slate-900/40 border border-slate-900/60 rounded-xl transition-all duration-300 animate-fade-in-up"
                  >
                    {/* 1. Staff Profile */}
                    <div className="col-span-3 flex items-center gap-3 min-w-0">
                      <div className="bg-[#0b0f19] border border-slate-800 p-2 rounded-lg text-blue-400 shrink-0">
                        <User size={14} />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-xs truncate">
                          {r.adminEmail ? r.adminEmail.split("@")[0] : "Unnamed"}
                        </h4>
                        <span
                          className={`text-[8px] font-black uppercase ${isBlocked ? "text-rose-500" : "text-emerald-500"}`}
                        >
                          {isBlocked ? "Blocked" : "Live"}
                        </span>
                      </div>
                    </div>

                    {/* 3. Access Parameters (Label updated) */}
                    <div className="col-span-3">
                      <span className="text-[11px] font-bold text-slate-300 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                        {r.permissions?.length || 0} Permissions Allowed
                      </span>
                    </div>

                    {/* 2. Contact Context */}
                    <div className="col-span-3 text-slate-400 font-mono text-[11px] truncate px-2">
                      {r.adminEmail}
                    </div>

                    {/* 4. Action Controls (Labels added & Eye removed) */}
                    <div className="col-span-3 flex justify-end items-center gap-6 pr-4">
                      <div className="flex flex-col items-center gap-1 group">
                        <button
                          onClick={() => handleOpenEditModal(r)}
                          className="text-slate-400 hover:text-white transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <span className="text-[8px] font-bold text-slate-500 uppercase group-hover:text-blue-400">
                          Edit
                        </span>
                      </div>

                      <div className="flex flex-col items-center gap-1 group">
                        <button
                          onClick={() => confirmDelete(r._id)}
                          className="text-slate-400 hover:text-rose-400 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                        <span className="text-[8px] font-bold text-slate-500 uppercase group-hover:text-rose-400">
                          Delete
                        </span>
                      </div>

                      <div className="flex flex-col items-center gap-1 group">
                        <button
                          onClick={() => handleToggleStatus(r._id)}
                          className={`transition-all ${isBlocked ? "text-rose-500" : "text-emerald-500"}`}
                        >
                          {actionLoading === r._id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : isBlocked ? (
                            <UserX size={16} />
                          ) : (
                            <UserCheck size={16} />
                          )}
                        </button>
                        <span className="text-[8px] font-bold text-slate-500 uppercase group-hover:text-emerald-400">
                          {isBlocked ? "Unblock" : "Block"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-slate-800 rounded-3xl bg-[#0b0f19]/50">
          <Search size={32} className="text-blue-500 mb-4 animate-bounce" />
          <h3 className="text-xl font-black text-white mb-2">No Roles Found</h3>
          <button
            onClick={handleOpenCreateModal}
            className="bg-blue-600 text-white font-bold px-5 py-3 rounded-2xl flex items-center gap-2"
          >
            <Plus size={16} /> Create New Role
          </button>
        </div>
      )}

      {/* Permissions Modal */}
      {isPermissionModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#131b2e] border border-slate-700 rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-white uppercase tracking-wider text-sm">
                Access Permissions
              </h3>
              <button
                onClick={() => setIsPermissionModalOpen(false)}
                className="text-slate-500 hover:text-white p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
              {selectedRole?.permissions?.length > 0 ? (
                selectedRole.permissions.map((p, i) => (
                  <div
                    key={i}
                    className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-[10px] font-bold text-slate-300 text-center uppercase"
                  >
                    {p.replace("view", "")}
                  </div>
                ))
              ) : (
                <p className="text-slate-600 text-xs italic p-2">
                  No permissions assigned.
                </p>
              )}
            </div>

            <button
              onClick={() => setIsPermissionModalOpen(false)}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl text-xs font-bold transition-all"
            >
              Close Panel
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <form
            onSubmit={handleCreateOrUpdateRole}
            className="bg-[#131b2e] border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl shadow-black/80 animate-scale-in"
          >
            <h3 className="text-md font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Shield size={16} className="text-blue-500 animate-pulse" />
              {isEditMode
                ? "Modify Access Context"
                : "Assign New Workspace Staff"}
            </h3>

            {!isEditMode && (
              <div className="grid grid-cols-1 gap-3">
                <input
                  required
                  placeholder="Staff Name"
                  className="w-full bg-[#0b0f19] border border-slate-800 focus:border-blue-500 p-3 rounded-xl text-xs text-white placeholder-slate-600 outline-none transition-all duration-300 focus:ring-1 focus:ring-blue-500/20"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                />
                <input
                  required
                  type="email"
                  placeholder="Email Configuration Address"
                  className="w-full bg-[#0b0f19] border border-slate-800 focus:border-blue-500 p-3 rounded-xl text-xs text-white placeholder-slate-600 outline-none transition-all duration-300 focus:ring-1 focus:ring-blue-500/20"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  required
                  type="password"
                  placeholder="Secure Account Key Password"
                  className="w-full bg-[#0b0f19] border border-slate-800 focus:border-blue-500 p-3 rounded-xl text-xs text-white placeholder-slate-600 outline-none transition-all duration-300 focus:ring-1 focus:ring-blue-500/20"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                Choose Module Boundaries
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                {ALL_PERMISSIONS.map((p) => {
                  const isChecked = selectedPermissions.includes(p.id);
                  return (
                    <div
                      key={p.id}
                      onClick={() => togglePermission(p.id)}
                      className={`p-2.5 rounded-xl text-[11px] font-medium cursor-pointer flex items-center justify-between border transition-all duration-200 active:scale-[0.98] ${
                        isChecked
                          ? "bg-blue-600/10 border-blue-500 text-blue-400 font-bold shadow-md shadow-blue-950/20"
                          : "bg-[#0b0f19] border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <span>{p.label}</span>
                      <div
                        className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all duration-200 ${isChecked ? "bg-blue-500 border-blue-400 text-white scale-110" : "border-slate-700 bg-slate-900"}`}
                      >
                        {isChecked && <Check size={10} strokeWidth={4} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-800/60">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer active:scale-95"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black tracking-wide cursor-pointer shadow-lg shadow-blue-950 transition-all active:scale-95"
              >
                {isEditMode ? "Save Scope Changes" : "Deploy Credentials"}
              </button>
            </div>
          </form>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#131b2e] border border-slate-800 p-6 rounded-2xl max-w-sm w-full text-center shadow-2xl animate-scale-in">
            <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Trash2 size={20} />
            </div>
            <h3 className="text-white font-black text-md mb-1">Delete Role?</h3>
            <p className="text-slate-500 text-xs px-2 mb-6">
              Are you sure? This action will completely isolate and delete this
              credential instance parameters.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={performDelete}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 rounded-xl text-xs font-black text-white transition-colors cursor-pointer shadow-lg shadow-red-950 transition-all active:scale-95"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
