import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Plus,
  Trash2,
  AlertTriangle,
  X,
  CheckCircle,
  Loader2,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Globe,
  Compass,
  Activity,
} from "lucide-react";

export default function AreaManagementView({ selectedBranchId }) {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionProcessing, setActionProcessing] = useState(false);
  const [newAreaInputs, setNewAreaInputs] = useState({});
  const [expandedBranches, setExpandedBranches] = useState({});

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    branchId: null,
    areaName: "",
  });

  const API_URL = import.meta.env.VITE_API_URL;

  const triggerToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "success" }),
      3000,
    );
  };

  useEffect(() => {
    const fetchBranchData = async () => {
      if (!selectedBranchId) return;
      try {
        setLoading(true);
        const token = localStorage.getItem("adminToken");
        const res = await axios.get(
          `${API_URL}/api/admin/branch-dashboard?branchId=${selectedBranchId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const allData = Array.isArray(res.data) ? res.data : [res.data];
        const filteredBranch = allData.filter(
          (branch) => branch._id === selectedBranchId,
        );
        setBranches(filteredBranch);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        triggerToast("Failed to retrieve operational layout matrix.", "error");
        setLoading(false);
      }
    };
    fetchBranchData();
  }, [selectedBranchId, API_URL]);

  const handleAreaInputChange = (branchId, value) => {
    setNewAreaInputs({ ...newAreaInputs, [branchId]: value });
  };

  const handleAddArea = async (branchId) => {
    const areaName = newAreaInputs[branchId]?.trim();
    if (!areaName) return;

    try {
      setActionProcessing(true);
      const token = localStorage.getItem("adminToken");
      const res = await axios.patch(
        `${API_URL}/api/admin/branch/add-area/${branchId}`,
        { areaName },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setBranches(branches.map((b) => (b._id === branchId ? res.data : b)));
      setNewAreaInputs({ ...newAreaInputs, [branchId]: "" });
      triggerToast("Delivery zone added successfully!", "success");
    } catch (err) {
      console.error(err);
      triggerToast("Error adding delivery boundary zone.", "error");
    } finally {
      setActionProcessing(false);
    }
  };

  const openDeleteModal = (branchId, areaName) => {
    setDeleteModal({ isOpen: true, branchId, areaName });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, branchId: null, areaName: "" });
  };

  const handleDeleteArea = async () => {
    const { branchId, areaName } = deleteModal;
    try {
      setActionProcessing(true);
      const token = localStorage.getItem("adminToken");
      const res = await axios.patch(
        `${API_URL}/api/admin/branch/delete-area/${branchId}`,
        { areaName },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setBranches(branches.map((b) => (b._id === branchId ? res.data : b)));
      closeDeleteModal();
      triggerToast("Zone removed successfully.", "success");
    } catch (err) {
      console.error(err);
      triggerToast("Error removing zone boundary.", "error");
    } finally {
      setActionProcessing(false);
    }
  };

  const totalAreasCount = branches[0]?.areas?.length || 0;
  const currentBranchName = branches[0]?.branchName || "None";
  const currentCityName = branches[0]?.city || "Not Set";

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
    <div className="p-4 sm:p-6 md:p-8 bg-[#0b0f19] min-h-screen font-sans text-slate-200 relative selection:bg-blue-500/30 selection:text-blue-200">
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none px-4"
          >
            <div className="flex items-center gap-3 px-15 py-3 rounded-xl shadow-2xl bg-[#223257] border border-slate-800/80 backdrop-blur-md pointer-events-auto w-full max-w-sm">
              <div
                className={`p-1.5 rounded-lg ${toast.type === "success" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}
              >
                {toast.type === "success" ? (
                  <CheckCircle size={16} />
                ) : (
                  <AlertTriangle size={16} />
                )}
              </div>
              <p className="text-xs font-semibold tracking-wide text-slate-300 flex-1">
                {toast.message}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/60 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-slate-900 text-blue-400 rounded-xl border border-slate-800 shadow-inner">
              <Layers size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white">
                Logistics & Zone Management
              </h2>
              <p className="text-xs text-slate-400">
                Define and allocate operational coverage sectors for active
                branches.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-blue-500/5 text-blue-400 border border-blue-500/10 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide self-start sm:self-center">
            <Sparkles size={12} className="animate-pulse" />
            <span>Live Synchronization Active</span>
          </div>
        </div>

        {branches.length > 0 && branches[0] && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="grid grid-cols-1 lg:grid-cols-3 cursor-pointer  gap-4 min-h-[160px] lg:h-[190px]"
          >
            <div className="bg-[#131b2e] border border-slate-800/80 rounded-2xl p-4.5 flex flex-col justify-between relative overflow-hidden group hover:scale-102 hover:border-blue-600/30 transition-all duration-300 shadow-md">
              <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:14px_14px] opacity-10 pointer-events-none" />

              <div className="flex justify-between items-start  relative z-10">
                <div className="space-y-0.5 ">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    Total Active Zones
                  </p>
                  <h4 className="text-xl font-black text-white tracking-tight mt-0.5 flex items-baseline gap-1.5">
                    {totalAreasCount}
                    <span className="text-[11px] font-medium text-slate-400 tracking-normal">
                      {totalAreasCount === 1 ? "Sector" : "Sectors"} Mapped
                    </span>
                  </h4>
                </div>
                <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/10 group-hover:scale-105 transition-transform duration-200">
                  <Compass size={18} />
                </div>
              </div>

              <div className="w-full h-14 mt-2 relative z-10 flex items-end">
                <svg
                  className="w-full h-full"
                  viewBox="0 0 300 60"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient
                      id="areaGraphGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#3b82f6"
                        stopOpacity="0.25"
                      />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  <motion.path
                    d="M 0 50 Q 45 45 90 25 T 185 35 T 300 12"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                  />

                  <motion.path
                    d="M 0 50 Q 45 45 90 25 T 185 35 T 300 12 L 300 60 L 0 60 Z"
                    fill="url(#areaGraphGradient)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  />

                  <motion.circle
                    cx="300"
                    cy="12"
                    r="3.5"
                    fill="#3b82f6"
                    stroke="#0b0f19"
                    strokeWidth="1.5"
                    animate={{ r: [3.5, 5, 3.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                </svg>
              </div>
            </div>

            <div className="bg-[#131b2e] border border-slate-800/80 hover:scale-102 rounded-2xl p-4.5 flex flex-col justify-between hover:border-rose-500/40 transition-all duration-300 shadow-md group">
              <div className="flex justify-between items-start">
                <div className="space-y-0.5">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    Active Stream Hub
                  </p>
                  <h4 className="text-lg font-extrabold text-white mt-0.5 tracking-wide truncate max-w-[200px] lg:max-w-[170px]">
                    {currentBranchName}
                  </h4>
                </div>
                <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/10 group-hover:rotate-6 transition-transform duration-200">
                  <MapPin size={18} />
                </div>
              </div>

              <div className="space-y-2 mt-2 border-t border-slate-800/60 pt-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">
                    Registry Status:
                  </span>
                  <span className="text-emerald-400 font-semibold bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 text-[10px] uppercase tracking-wider">
                    Connected
                  </span>
                </div>

                <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden mt-0.5">
                  <motion.div
                    className="bg-rose-500 h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: totalAreasCount > 0 ? "75%" : "15%" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-[#131b2e] border ahover:scale-102 border-slate-800/80 rounded-2xl p-4.5 flex flex-col justify-between hover:border-emerald-500/30 transition-all duration-300 shadow-md group">
              <div className="flex justify-between items-start">
                <div className="space-y-0.5">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    Operational City
                  </p>
                  <h4 className="text-lg font-extrabold text-white mt-0.5 uppercase tracking-wider">
                    {currentCityName}
                  </h4>
                </div>
                <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/10 group-hover:scale-105 transition-transform duration-200">
                  <Globe size={18} />
                </div>
              </div>

              <div className="space-y-2 mt-2 border-t border-slate-800/60 pt-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">
                    Geographic Axis:
                  </span>
                  <span className="text-slate-200 font-bold uppercase text-[11px] tracking-wide">
                    {currentCityName !== "Not Set"
                      ? `${currentCityName}`
                      : "Unassigned"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">
                    Coverage Level:
                  </span>
                  <span className="text-blue-400 font-semibold text-[11px]">
                    {totalAreasCount > 5
                      ? "High Density"
                      : totalAreasCount > 0
                        ? "Standard"
                        : "None"}
                  </span>
                </div>
                <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden mt-0.5">
                  <motion.div
                    className="bg-emerald-500 h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: totalAreasCount > 0 ? "100%" : "0%" }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {branches.length === 0 || !branches[0] ? (
        /* Enhanced Empty State Block */
        <div className="text-center py-24 bg-[#131b2e]/60 border-2 border-dashed border-slate-800/80 rounded-2xl p-8 flex flex-col items-center justify-center backdrop-blur-sm max-w-2xl mx-auto my-8 shadow-2xl">
          <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800 mb-4 text-slate-500 shadow-inner">
            <MapPin size={36} className="animate-pulse text-indigo-500/80" />
          </div>
          <h4 className="text-sm font-bold text-slate-300 uppercase tracking-widest">
            No Hub Context Selected
          </h4>
          <p className="text-xs text-slate-500 max-w-xs mt-2 leading-relaxed font-medium">
            Please utilize the global filters on top to synchronize data branch architectures and route streams.
          </p>
        </div>
      ) : (
        /* Professional Structural Grid Dashboard */
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 p-1">
          {branches.map((branch) => {
            const isExpanded = expandedBranches[branch._id];
            const displayAreas = isExpanded
              ? branch.areas
              : branch.areas?.slice(0, 8);

            return (
              <motion.div
                key={branch._id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="bg-gradient-to-b from-[#131b2e] to-[#0f1626] rounded-2xl border border-slate-800 hover:border-slate-700/80 shadow-2xl p-5 md:p-6 flex flex-col justify-between transition-all duration-300 relative group overflow-hidden"
              >
                {/* Visual Accent Ambient Lighting on card hover */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div>
                  {/* Card Upper Header Context Area */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-800/80 pb-4 mb-5">
                    <div className="flex items-center gap-3.5">
                      <div className="p-3 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl shadow-lg shadow-rose-950/20 shrink-0">
                        <MapPin size={18} className="drop-shadow-[0_0_6px_rgba(244,63,94,0.3)]" />
                      </div>
                      <div className="truncate">
                        <h3 className="font-extrabold text-sm md:text-base text-slate-100 tracking-wide capitalize truncate">
                          {branch.branchName}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Region Axis:</span>
                          <span className="text-blue-400 font-mono font-bold uppercase text-[9px] bg-slate-900/90 border border-slate-800 px-2 py-0.5 rounded-md tracking-wider">
                            {branch.city || "Global Cluster"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Meta Indicator pill status badge */}
                    <div className="flex items-center gap-2 self-start sm:self-center bg-slate-950/40 border border-slate-800/60 pl-2.5 pr-3 py-1.5 rounded-xl shrink-0">
                      <Layers size={11} className="text-slate-500" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Boundaries: <span className="text-white ml-0.5 font-mono">{branch.areas?.length || 0}</span>
                      </span>
                    </div>
                  </div>

                  {/* Core Zones Grid Content Layout Section */}
                  <div className="mb-5">
                    {branch.areas?.length === 0 ? (
                      <div className="py-8 flex flex-col items-center justify-center border border-dashed border-slate-800/80 rounded-xl bg-slate-900/10">
                        <MapPin size={20} className="text-slate-700 mb-2" />
                        <p className="text-xs italic font-medium text-slate-500 px-4 text-center">
                          No active delivery zones mapped to this node yet.
                        </p>
                      </div>
                    ) : (
                      <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                        <AnimatePresence mode="popLayout">
                          {displayAreas?.map((area, index) => (
                            <motion.div
                              key={area + index}
                              initial={{ opacity: 0, scale: 0.94 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.94 }}
                              transition={{ duration: 0.18 }}
                              className="bg-slate-900/40 text-slate-300 border border-slate-800/60 hover:border-rose-500/30 hover:bg-rose-500/[0.01] text-xs pl-3 pr-2 py-2 rounded-xl flex items-center justify-between gap-1.5 transition-all duration-200 group/zone hover:shadow-lg hover:shadow-black/10"
                            >
                              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                <span className="w-1 h-1 rounded-full bg-slate-600 group-hover/zone:bg-rose-400 shrink-0 transition-colors" />
                                <span className="font-semibold text-slate-300 tracking-wide truncate group-hover/zone:text-slate-100">
                                  {area}
                                </span>
                              </div>
                              <button
                                title="Delete Area Node"
                                type="button"
                                onClick={() => openDeleteModal(branch._id, area)}
                                className="text-slate-600 hover:text-rose-400 p-1 rounded-lg hover:bg-rose-500/10 opacity-60 group-hover/zone:opacity-100 cursor-pointer transition-all shrink-0"
                              >
                                <Trash2 size={12} />
                              </button>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </motion.div>
                    )}

                    {/* Smart Show More/Less Drop-Trigger Row */}
                    {branch.areas?.length > 8 && (
                      <div className="flex justify-start mt-3.5">
                        <button
                          title={isExpanded ? "Collapse View" : "Expand All Zones"}
                          type="button"
                          onClick={() =>
                            setExpandedBranches({
                              ...expandedBranches,
                              [branch._id]: !isExpanded,
                            })
                          }
                          className="text-[11px] font-bold cursor-pointer text-blue-400 hover:text-blue-300 flex items-center gap-1.5 transition-all px-3 py-1.5 bg-blue-500/5 hover:bg-blue-500/10 rounded-xl border border-blue-500/10"
                        >
                          {isExpanded ? (
                            <>
                              Collapse Streams <ChevronUp size={12} />
                            </>
                          ) : (
                            <>
                              Expand ({branch.areas.length - 8} More) <ChevronDown size={12} />
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Inline Zone Entry Form Field Component Block */}
                <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-900/80 mt-auto">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAddArea(branch._id);
                    }}
                    className="flex gap-2"
                  >
                    <div className="relative flex-1 flex items-center">
                      <span className="absolute left-3 text-slate-600 text-xs font-mono select-none">📍</span>
                      <input
                        type="text"
                        placeholder="Enter sector or dynamic zone name..."
                        value={newAreaInputs[branch._id] || ""}
                        onChange={(e) =>
                          handleAreaInputChange(branch._id, e.target.value)
                        }
                        className="w-full bg-[#0b0f19] border border-slate-800/80 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-hidden focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/10 transition-all font-semibold tracking-wide"
                        disabled={actionProcessing}
                      />
                    </div>
                    <button
                      title="Append New Hub Area Node"
                      type="submit"
                      disabled={actionProcessing}
                      className="bg-blue-600 hover:bg-blue-500 text-white cursor-pointer disabled:bg-slate-900 disabled:text-slate-600 font-bold text-xs px-4 rounded-lg transition-all flex items-center gap-1.5 border border-blue-500/10 shadow-lg shadow-blue-600/10 active:scale-[0.97]"
                    >
                      {actionProcessing ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <>
                          <Plus size={14} className="stroke-[2.5]" />
                          <span className="hidden sm:inline tracking-wider">Add Node</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
      </div>

      <AnimatePresence>
        {deleteModal.isOpen && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDeleteModal}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#0f172a] border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-rose-600" />

              <button
                type="button"
                onClick={closeDeleteModal}
                className="absolute top-4 right-4 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer p-1 rounded-full hover:bg-rose-500/10"
              >
                <X size={16} />
              </button>

              <div className="flex flex-col items-center text-center mb-6">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-4 shadow-inner">
                  <AlertTriangle size={24} />
                </div>
                <h3 className="text-base font-bold text-white tracking-wide">
                  Remove Delivery Zone?
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mt-2 px-2">
                  Are you absolutely sure you want to delete{" "}
                  <span className="text-rose-400 font-bold">
                    "{deleteModal.areaName}"
                  </span>
                  ? This action cannot be undone.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteArea}
                  disabled={actionProcessing}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 min-w-[70px] cursor-pointer shadow-lg shadow-rose-900/20"
                >
                  {actionProcessing ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    "Confirm Delete"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
