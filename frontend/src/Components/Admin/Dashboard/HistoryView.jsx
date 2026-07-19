import { getApiBase } from "../../../lib/apiBase.js";
import React, { useState, useEffect } from "react";
import {
  Check,
  X,
  Clock,
  Search,
  User,
  TrendingUp,
  History,
  Loader2,
} from "lucide-react";
import axios from "axios";
import { motion } from "framer-motion";
function HistoryView({ selectedBranchId }) {
  const [historyOrders, setHistoryOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      if (!selectedBranchId) return;
      try {
        setLoading(true);
        const token = localStorage.getItem("adminToken");
        const res = await axios.get(
          `${getApiBase()}/admin/orders/history`,
          {
            headers: {
              Authorization: "Bearer " + token,
              "branch-id": selectedBranchId,
            },
          },
        );

        const formattedData = res.data.map((order) => ({
          ...order,
          status: order.status === "Accepted" ? "completed" : "rejected",
          date: new Date(order.createdAt).toLocaleDateString("en-PK"),
        }));
        setHistoryOrders(formattedData);
      } catch (err) {
        console.error("Error fetching history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [selectedBranchId]);

  const filteredOrders = historyOrders.filter((order) => {
    const matchesFilter =
      filterStatus === "all" || order.status === filterStatus;
    const matchesSearch = order.customerName
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
    <div className="p-4 sm:p-8 bg-[#0b0f19] min-h-screen text-slate-200">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
        >
          {/* Icon and Title */}
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="bg-indigo-600/10 p-3 rounded-2xl text-indigo-500 border border-indigo-500/20"
            >
              <History size={24} />
            </motion.div>
            <div>
              <h2 className="text-lg font-black text-white">Order History</h2>
              <p className="text-xs text-slate-500">
                Track all your past completed and rejected orders.
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80 group">
            <Search
              className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-blue-400 transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by name..."
              className="w-full bg-[#131b2e] border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition-all"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[
            {
              title: "Completed",
              count: historyOrders.filter((o) => o.status === "completed")
                .length,
              color: "emerald",
              icon: Check,
            },
            {
              title: "Rejected",
              count: historyOrders.filter((o) => o.status === "rejected")
                .length,
              color: "rose",
              icon: X,
            },
            {
              title: "Total History",
              count: historyOrders.length,
              color: "blue",
              icon: History,
            },
          ].map((item, idx) => {
            const colorClasses = {
              emerald: { text: "text-emerald-400", fill: "fill-emerald-500" },
              rose: { text: "text-rose-400", fill: "fill-rose-500" },
              blue: { text: "text-blue-400", fill: "fill-blue-500" },
            };

            const colors = colorClasses[item.color];

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-[#131b2e] border border-slate-800 p-6 rounded-3xl flex justify-between items-center hover:border-slate-700 transition-all relative overflow-hidden group cursor-pointer"
              >
                <div className="relative z-10">
                  <p
                    className={`text-[10px] uppercase tracking-widest ${colors.text} font-bold`}
                  >
                    {item.title}
                  </p>
                  <p className="text-3xl font-black text-white mt-1">
                    {item.count}
                  </p>
                </div>

                <div
                  className={`p-4 bg-slate-900 rounded-2xl ${colors.text} border border-slate-800 relative z-10`}
                >
                  <item.icon size={24} />
                </div>

                <div className="absolute bottom-0 left-0 w-full h-24 opacity-30 group-hover:opacity-50 transition-opacity">
                  <svg viewBox="0 0 100 25" className="w-full h-full">
                    <path
                      d="M0 25 L0 15 Q25 0 50 15 T100 5 L100 25 Z"
                      className={`${colors.fill}`}
                    />
                  </svg>
                </div>
              </motion.div>
            );
          })}
        </div>
        <div className="flex gap-2 p-1.5  rounded-2xl w-fit border border-slate-800 bg-[#0b0f19]">
          {["all", "completed", "rejected"].map((tab) => (
            <button
              title="Seletc your Status"
              key={tab}
              onClick={() => setFilterStatus(tab)}
              className="relative px-6 py-2 text-xs cursor-pointer font-bold capitalize transition-colors duration-300 z-10"
            >
              {filterStatus === tab && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-blue-600 rounded-xl shadow-lg"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}

              <span
                className={`relative z-20 ${filterStatus === tab ? "text-white" : "text-slate-500 hover:text-white"}`}
              >
                {tab}
              </span>
            </button>
          ))}
        </div>

        <div className="bg-[#131b2e] border border-slate-800 rounded-3xl overflow-hidden">
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full"></div>
                <Search size={48} className="text-slate-600  relative z-10" />
              </div>

              <h3 className="text-white font-bold text-lg mb-1">
                No History found
              </h3>
              <p className="text-slate-500 text-sm">
                Try searching for something else or change the category filter.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden lg:block cursor-pointer overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-slate-500 text-[10px] uppercase border-b border-slate-800">
                      <th className="p-6">Order ID</th>
                      <th className="p-6">Customer</th>
                      <th className="p-6">Product</th>
                      <th className="p-6">Status</th>
                      <th className="p-6">Trend</th>
                      <th className="p-6">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredOrders.map((order) => (
                      <tr
                        key={order._id}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="p-6 font-bold text-slate-300">
                          ORD-{order._id.slice(-4).toUpperCase()}
                        </td>
                        <td className="p-6 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-blue-400">
                            {order.customerName?.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm capitalize">
                            {order.customerName}
                          </span>
                        </td>
                        <td className="p-6 text-sm text-slate-400">
                          {order.items?.[0]?.name || "N/A"}
                        </td>
                        <td className="p-6">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-bold ${order.status === "completed" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}
                          >
                            {order.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-6">
                          <TrendingUp
                            size={18}
                            className={
                              order.status === "completed"
                                ? "text-emerald-500"
                                : "text-rose-500"
                            }
                          />
                        </td>
                        <td className="p-6 font-black text-white">
                          Rs. {order.totalBill}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="lg:hidden p-4 space-y-4">
                {filteredOrders.map((order) => (
                  <div
                    key={order._id}
                    className="bg-[#0b0f19] border border-slate-800 p-4 rounded-2xl space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-500">
                        ORD-{order._id.slice(-4).toUpperCase()}
                      </span>
                      <TrendingUp
                        size={16}
                        className={
                          order.status === "completed"
                            ? "text-emerald-500"
                            : "text-rose-500"
                        }
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-blue-400">
                        {order.customerName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-white capitalize">
                          {order.customerName}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {order.items?.[0]?.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-slate-800">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold ${order.status === "completed" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}
                      >
                        {order.status.toUpperCase()}
                      </span>
                      <span className="font-black text-lg text-white">
                        Rs. {order.totalBill}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default HistoryView;
