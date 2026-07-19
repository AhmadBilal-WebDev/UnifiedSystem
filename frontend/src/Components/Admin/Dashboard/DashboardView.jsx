import { getApiBase } from "../../../lib/apiBase.js";
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FcAcceptDatabase } from "react-icons/fc";
import { MdOutlineCancel } from "react-icons/md";
import {
  ChevronDown,
  ShoppingCart,
  DollarSign,
  ClipboardList,
  TrendingUp,
  Activity,
  User,
  Calendar,
  Layers,
  BarChart3,
  PieChart,
  AlertCircle,
} from "lucide-react";
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};

const dropdownVariants = {
  hidden: { opacity: 0, y: -8, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", duration: 0.3, bounce: 0.15 },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.97,
    transition: { duration: 0.15 },
  },
};

export default function DashboardOverview({ selectedBranchId }) {
  const [filter, setFilter] = useState("7 Days");
  const [isOpen, setIsOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [stats, setStats] = useState({
    todayOrders: "0",
    todayIncome: "$0",
    pendingOrders: "0",
  });
  const [filterStats, setFilterStats] = useState({
    totalIncome: 0,
    acceptedCount: 0,
    rejectedCount: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedBranchId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("adminToken");
        const config = {
          headers: { Authorization: `Bearer ${token}` },
          params: { branchId: selectedBranchId },
        };

        const [statsRes, ordersRes, topSellingRes] = await Promise.all([
          axios.get(
            `${getApiBase()}/api/admin/dashboard-stats`,
            config,
          ),
          axios.get(
            `${getApiBase()}/api/admin/latest-orders`,
            config,
          ),
          axios.get(
            `${getApiBase()}/api/admin/top-selling`,
            config,
          ),
        ]);

        setStats(statsRes.data);
        setOrders(ordersRes.data);
        setTopCategories(topSellingRes.data);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedBranchId]);
  useEffect(() => {
    const fetchFilteredData = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await axios.get(
          `${getApiBase()}/api/admin/filtered-stats`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { branchId: selectedBranchId, filter },
          },
        );
        setFilterStats(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    if (selectedBranchId) fetchFilteredData();
  }, [filter, selectedBranchId]);

  const renderItems = (items) =>
    Array.isArray(items)
      ? items.map((i) => i.name || "Item").join(", ")
      : items || "N/A";

  const staticCards = [
    {
      title: "Today Orders",
      value: stats.todayOrders,
      icon: <ShoppingCart size={16} />,
      colorClass:
        "from-rose-500/20 to-rose-600/5 text-rose-400 border-rose-500/20",
    },
    {
      title: "Today Income",
      value: stats.todayIncome,
      icon: <DollarSign size={16} />,
      colorClass:
        "from-indigo-500/20 to-indigo-600/5 text-indigo-400 border-indigo-500/20",
    },
    {
      title: "Pending",
      value: stats.pendingOrders,
      icon: <ClipboardList size={16} />,
      colorClass:
        "from-amber-500/20 to-amber-600/5 text-amber-400 border-amber-500/20",
    },
  ];

  const filteredCards = useMemo(
    () => [
      {
        title: "Total Income",
        value: `Rs. ${(filterStats.totalIncome || 0).toLocaleString()}`,
        icon: <DollarSign size={16} />,
        colorClass:
          "from-emerald-500/20 to-emerald-600/5 text-emerald-400 border-emerald-500/20",
      },
      {
        title: "Accepted",
        value: (filterStats.acceptedCount || 0).toString(),
        icon: <FcAcceptDatabase size={16} />,
        colorClass:
          "from-sky-500/20 to-sky-600/5 text-sky-400 border-sky-500/20",
      },
      {
        title: "Rejected",
        value: (filterStats.rejectedCount || 0).toString(),
        icon: <MdOutlineCancel size={16} className="text-rose-400" />,
        colorClass:
          "from-red-500/20 to-red-600/5 text-red-400 border-red-500/20",
      },
    ],
    [filterStats],
  );

  const CardItem = ({ card, chartType }) => (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="relative overflow-hidden bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 p-4 rounded-2xl shadow-lg shadow-black/20 flex flex-col justify-between group w-full"
    >
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-700/50 to-transparent group-hover:via-rose-500/40 transition-all duration-300" />

      <div className="flex justify-between items-start w-full">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2 rounded-xl bg-gradient-to-br ${card.colorClass || "from-slate-800 to-slate-900 border-slate-700"} border shadow-inner`}
          >
            {card.icon}
          </div>
          <h3 className="text-slate-400 font-semibold text-xs tracking-wide uppercase">
            {card.title}
          </h3>
        </div>
        <span className="text-emerald-400 text-[10px] font-bold px-1.5 py-0.5 bg-emerald-500/5 border border-emerald-500/10 rounded-md tracking-tight flex items-center gap-0.5">
          <TrendingUp size={10} /> + Live
        </span>
      </div>

      <div className="flex items-end justify-between mt-5 w-full">
        <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
          {card.value}
        </h2>

        <div className="h-7 w-16 flex items-end justify-end opacity-75 group-hover:opacity-100 transition-opacity">
          {chartType === "line" && (
            <svg
              className="w-full h-full stroke-rose-400 fill-none"
              viewBox="0 0 100 30"
              strokeWidth="2.5"
            >
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, ease: "easeInOut" }}
                d="M0 25 L20 12 L40 18 L60 4 L80 14 L100 3"
              />
            </svg>
          )}
          {chartType === "bars" && (
            <div className="flex gap-0.5 items-end h-full">
              {[8, 14, 18, 10, 24, 15, 20].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}px` }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  className="w-1.5 bg-indigo-500/80 rounded-t-[2px] transition-all duration-300 group-hover:bg-indigo-400"
                />
              ))}
            </div>
          )}
          {chartType === "circle" && (
            <div
              className="w-5 h-5 rounded-full border-2 border-amber-400 border-t-transparent animate-spin"
              style={{ animationDuration: "3s" }}
            />
          )}
          {chartType === "area" && (
            <svg
              className="w-full h-full fill-emerald-500/10 stroke-emerald-400"
              viewBox="0 0 100 30"
              strokeWidth="2"
            >
              <motion.path
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1 }}
                d="M0 30 L0 20 L20 8 L40 22 L60 4 L80 14 L100 30 Z"
              />
            </svg>
          )}
          {chartType === "dots" && (
            <div className="flex gap-1 items-center mb-1">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="w-1.5 h-1.5 rounded-full bg-sky-400 shadow-sm shadow-sky-400/50 animate-pulse"
                  style={{ animationDelay: `${n * 0.2}s` }}
                />
              ))}
            </div>
          )}
          {chartType === "progress" && (
            <div className="w-full bg-slate-800 rounded-full h-1.5 mb-1 relative overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "68%" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="bg-rose-500 h-full rounded-full shadow-md shadow-rose-500/40"
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

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
    <div className="min-h-screen bg-[#0b0f19] bg-radial-at-t from-slate-900 via-slate-950 to-black p-4 md:p-8 text-slate-100 font-sans relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-600/5 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-rose-600/5 rounded-full filter blur-3xl pointer-events-none" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto relative z-10 space-y-6"
      >
        {/* Header Block */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-900"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 rounded-xl border border-slate-800 text-indigo-400 shadow-inner">
              <Activity size={18} />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">
                Operations Telemetry
              </h1>
              <p className="text-slate-500 mt-2 text-xs font-medium">
                Realtime financial logs and core delivery monitoring dashboards.
              </p>
            </div>
          </div>
          {/* <span className="text-[10px] font-mono bg-slate-900 text-slate-400 px-3 py-1 rounded-md border border-slate-800">
            Branch Segment: ID_
            {selectedBranchId?.slice(-6).toUpperCase() || "NULL"}
          </span> */}
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-slate-900/30 border border-slate-900 p-5 rounded-2xl backdrop-blur-md"
        >
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-4">
            <Layers size={12} className="text-rose-500" />{" "}
            <span>Overall Realtime Logs</span>
          </div>
          <div className="grid grid-cols-1 cursor-pointer gap-4 lg:grid-cols-3">
            <CardItem card={staticCards[0]} chartType="line" />
            <CardItem card={staticCards[1]} chartType="bars" />
            <CardItem card={staticCards[2]} chartType="circle" />
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-slate-900/30 border border-slate-900 p-5 rounded-2xl backdrop-blur-md"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-slate-500">
              <Calendar size={12} className="text-indigo-400" />{" "}
              <span>Interval Report Stream</span>
            </div>

            <div className="relative w-full sm:w-44">
              <div
                className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl cursor-pointer flex justify-between items-center transition-all text-xs font-bold text-slate-200"
                onClick={() => setIsOpen(!isOpen)}
              >
                <span>{filter}</span>
                <ChevronDown
                  className={`text-slate-500 transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`}
                  size={14}
                />
              </div>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute z-30 w-full mt-1.5 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl p-1 overflow-hidden"
                  >
                    {["7 Days", "30 Days", "1 Year"].map((item) => (
                      <div
                        key={item}
                        className={`p-2.5 hover:bg-slate-900 text-xs font-semibold cursor-pointer rounded-lg transition-colors ${filter === item ? "text-indigo-400 bg-slate-900/40" : "text-slate-400"}`}
                        onClick={() => {
                          setFilter(item);
                          setIsOpen(false);
                        }}
                      >
                        {item}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 cursor-pointer gap-4">
            <CardItem card={filteredCards[0]} chartType="area" />
            <CardItem card={filteredCards[1]} chartType="dots" />
            <CardItem card={filteredCards[2]} chartType="progress" />
          </div>
        </motion.div>

        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl backdrop-blur-xl shadow-2xl">
          <div className="flex flex-col gap-1 mb-6">
            {/* Chota Label aur Icon */}
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-slate-500">
              <BarChart3 size={12} className="text-indigo-400" />
              <span>Top Selling Items</span>
            </div>
          </div>

          <div className="space-y-5">
            {topCategories.length > 0 ? (
              topCategories.map((item, i) => (
                <motion.div
                  layout
                  key={item.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="group flex items-center gap-4 hover:scale-101 cursor-pointer p-2 rounded-xl transition-colors"
                >
                  <span className="text-xs font-semibold text-slate-300 w-28 truncate">
                    {item.name}
                  </span>

                  <div className="flex-1 h-2 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: item.percent }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className={`h-full ${item.color} rounded-full`}
                    />
                  </div>

                  <div className="w-12 text-right">
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-950 px-2 py-1 rounded-md border border-white/5">
                      {item.percent}
                    </span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="flex flex-col cursor-pointer  items-center justify-center py-10 text-slate-500">
                <AlertCircle
                  size={32}
                  className="mb-2 opacity-50 text-indigo-400"
                />
                <p className="text-xs font-bold uppercase tracking-widest">
                  No performance data detected
                </p>
              </div>
            )}
          </div>
        </div>
        
        <motion.div
          variants={itemVariants}
          className="bg-slate-900/40 border border-slate-900 rounded-2xl overflow-hidden backdrop-blur-md shadow-xl shadow-black/20"
        >
          <div className="p-5 border-b border-slate-900 bg-slate-900/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="flex flex-col gap-1 mb-6">
              {/* Icon aur Chota Label */}
              <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-slate-500">
                <ClipboardList size={12} className="text-indigo-400" />
                <span>System Log</span>
              </div>
            </div>
            <span className="text-[10px] cursor-pointer font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/5 px-2.5 py-1 rounded-md border border-indigo-500/10">
              Live Feed
            </span>
          </div>

          {orders.length > 0 ? (
            <>
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-950/40 text-slate-500 border-b border-slate-900/50">
                    <tr>
                      <th className="text-left px-5 py-3.5 font-bold uppercase tracking-wider">
                        Customer Profile
                      </th>
                      <th className="text-left px-5 py-3.5 font-bold uppercase tracking-wider">
                        Manifest Hash
                      </th>
                      <th className="text-left px-5 py-3.5 font-bold uppercase tracking-wider">
                        Consumable Nodes
                      </th>
                      <th className="text-left px-5 py-3.5 font-bold uppercase tracking-wider">
                        Network Status
                      </th>
                      <th className="text-left px-5 py-3.5 font-bold uppercase tracking-wider">
                        Gross Value
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/40">
                    {orders.map((order, i) => {
                      const isAccepted = order.status === "Accepted";
                      const isRejected = order.status === "Rejected";

                      return (
                        <tr
                          key={i}
                          className="hover:bg-slate-900/30 transition-colors border-t border-slate-900/40"
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs border ${
                                  isAccepted
                                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                    : isRejected
                                      ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                                      : "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
                                }`}
                              >
                                {order.customerName
                                  ?.charAt(0)
                                  .toUpperCase() || <User size={14} />}
                              </div>
                              <div>
                                <p className="font-bold text-slate-200 capitalize tracking-tight">
                                  {order.customerName || "Anonymous Node"}
                                </p>
                                <p className="text-slate-500 text-[11px] font-medium font-mono">
                                  {order.phoneNumber || "0000-0000000"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-slate-400 font-mono text-[11px]">
                            ORD-{order._id?.slice(-4).toUpperCase() || "N/A"}
                          </td>
                          <td className="px-5 py-3.5 text-slate-300 font-medium max-w-xs truncate">
                            {renderItems(order.items)}
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border ${
                                isAccepted
                                  ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
                                  : isRejected
                                    ? "bg-rose-500/5 border-rose-500/20 text-rose-400"
                                    : "bg-indigo-500/5 border-indigo-500/20 text-indigo-400"
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 font-black text-white text-sm">
                            Rs. {order.totalBill || 0}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Feed Rendering */}
              <div className="lg:hidden p-4 space-y-3.5">
                {orders.map((order, i) => {
                  const isAccepted = order.status === "Accepted";
                  const isRejected = order.status === "Rejected";

                  return (
                    <div
                      key={i}
                      className="bg-slate-950/40 p-4 rounded-xl border border-slate-900 relative overflow-hidden"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs border ${
                              isAccepted
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                : isRejected
                                  ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                                  : "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
                            }`}
                          >
                            {order.customerName?.charAt(0).toUpperCase() || (
                              <User size={12} />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-200 text-xs capitalize">
                              {order.customerName}
                            </p>
                            <p className="text-slate-500 text-[10px] font-mono">
                              {order.phoneNumber}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[9px] font-black tracking-wider uppercase border ${
                            isAccepted
                              ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
                              : isRejected
                                ? "bg-rose-500/5 border-rose-500/20 text-rose-400"
                                : "bg-indigo-500/5 border-indigo-500/20 text-indigo-400"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>

                      <div className="space-y-1.5 mt-3 pt-3 border-t border-slate-900/60 text-[11px]">
                        <div className="flex justify-between items-center font-medium">
                          <p className="text-slate-500 font-mono flex items-center gap-1">
                            <ClipboardList
                              size={12}
                              className="text-slate-600"
                            />{" "}
                            ORD-{order._id?.slice(-4).toUpperCase()}
                          </p>
                          <p className="font-bold text-sm text-slate-200">
                            Rs. {order.totalBill}
                          </p>
                        </div>
                        <div className="text-slate-400 flex items-center gap-1.5">
                          <ShoppingCart
                            size={12}
                            className="text-slate-600 flex-shrink-0"
                          />
                          <span className="truncate max-w-[240px]">
                            {renderItems(order.items)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="p-12 flex flex-col items-center justify-center text-slate-600">
              <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 mb-2 opacity-50">
                <ShoppingCart size={28} />
              </div>
              <p className="text-xs font-bold uppercase tracking-wider">
                No active logs detected
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
