import React, { useEffect, useState } from "react";
import {
  Loader2,
  Phone,
  MapPin,
  User,
  Search,
  X,
  AlertTriangle,
  ClipboardList,
  TrendingUp,
  Activity,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  Home,
} from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const backendApi = import.meta.env.VITE_API_URL;

export default function OrdersView({ selectedBranchId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [actionModal, setActionModal] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      const query = selectedBranchId
        ? `?branchId=${encodeURIComponent(selectedBranchId)}`
        : "";
      const response = await axios.get(`${backendApi}/admin/orders${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedBranchId]);

  const updateOrderStatus = async (orderId, status) => {
    try {
      // Database format ke mutabiq exact capitalized status send aur update hoga
      await axios.patch(
        `${backendApi}/admin/order/status/${orderId}`,
        { status: status }, 
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        },
      );

      // Local state update with matching database string format
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId
            ? { ...order, status: status }
            : order,
        ),
      );

      fetchOrders();
      setSelectedOrder(null);
      setActionModal(null);
    } catch (err) {
      alert("Error updating order");
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

  const filteredOrders = orders.filter(
    (o) =>
      o.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.area?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // FIXED COUNTERS: Dono dynamic values database ke strict "Accepted" aur "Rejected" layout par check ho rahi hain
  const pendingCount = filteredOrders.filter(
    (o) => o.status === "Pending" || o.status === "pending" || !o.status,
  ).length;

  const acceptedCount = filteredOrders.filter(
    (o) => o.status === "Rccepted" || o.status === "accepted" ,
  ).length;

  const rejectedCount = filteredOrders.filter(
    (o) => o.status === "Rejected" || o.status === "rejected",
  ).length;

  const totalVolume = filteredOrders.reduce(
    (acc, curr) => acc + (Number(curr.totalBill) || 0),
    0,
  );
  const averageTicket = filteredOrders.length
    ? Math.round(totalVolume / filteredOrders.length)
    : 0;

  return (
    <div className="p-3 sm:p-6 lg:p-8 bg-[#070a13] min-h-screen text-slate-300 selection:bg-blue-500/30 selection:text-white font-sans antialiased">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-dashboard-scroll::-webkit-scrollbar { height: 4px; width: 4px; }
        .custom-dashboard-scroll::-webkit-scrollbar-track { background: #0f1626; border-radius: 10px; }
        .custom-dashboard-scroll::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        .custom-dashboard-scroll::-webkit-scrollbar-thumb:hover { background: #334155; }
      `,
        }}
      />

      <div className="max-w-7xl mx-auto space-y-5 transition-all duration-500 ease-in-out">
        {/* Header Stream Panel */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800/60 pb-5"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-slate-800 to-slate-900 text-blue-400 rounded-xl border border-slate-700/50 shadow-lg">
              <ClipboardList size={18} />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight">
                Operational Stream
              </h2>
              <p className="text-[11px] text-slate-500">
                Live branch execution dashboard & dynamic controls
              </p>
            </div>
          </div>

          <div className="relative w-full md:w-80 group">
            <div className="absolute left-3 top-0 bottom-0 flex items-center pointer-events-none z-10">
              <Search
                className="text-slate-500 group-focus-within:text-blue-400 transition-colors duration-300"
                size={14}
              />
            </div>
            <input
              type="text"
              placeholder="Search customer or sector..."
              title="Type to search orders by customer name or area"
              className="w-full bg-[#0f1626] border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500/40 transition-all duration-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </motion.div>

        {/* Optimized Responsive Grid Container */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {/* Card 1: Pending */}
          <div
            title="Total orders currently waiting for verification"
            className="group relative bg-gradient-to-br from-[#11192e] via-[#0f1626]/80 to-[#070a13]/90 border border-slate-800/80 rounded-2xl p-4 sm:p-5 flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)] overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/10 transition-transform duration-300 group-hover:scale-110 shrink-0">
              <Clock size={20} className="sm:size-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] sm:text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-0.5">
                Pending
              </p>
              <h4 className="text-sm sm:text-base font-black text-white tracking-tight">
                {pendingCount}{" "}
                <span className="text-slate-500 text-xs font-normal">
                  orders
                </span>
              </h4>
            </div>
          </div>

          {/* Card 2: Accepted */}
          {/* <div
            title="Total orders successfully accepted and processing"
            className="group relative bg-gradient-to-br from-[#11192e] via-[#0f1626]/80 to-[#070a13]/90 border border-slate-800/80 rounded-2xl p-4 sm:p-5 flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)] overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/10 transition-transform duration-300 group-hover:scale-110 shrink-0">
              <CheckCircle2 size={20} className="sm:size-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] sm:text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-0.5">
                Accepted
              </p>
              <h4 className="text-sm sm:text-base font-black text-white tracking-tight">
                {acceptedCount}{" "}
                <span className="text-slate-500 text-xs font-normal">
                  orders
                </span>
              </h4>
            </div>
          </div> */}

          {/* Card 3: Rejected */}
          {/* <div
            title="Total orders marked as rejected"
            className="group relative bg-gradient-to-br from-[#11192e] via-[#0f1626]/80 to-[#070a13]/90 border border-slate-800/80 rounded-2xl p-4 sm:p-5 flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:border-rose-500/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)] overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/10 transition-transform duration-300 group-hover:scale-110 shrink-0">
              <XCircle size={20} className="sm:size-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] sm:text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-0.5">
                Rejected
              </p>
              <h4 className="text-sm sm:text-base font-black text-white tracking-tight">
                {rejectedCount}{" "}
                <span className="text-slate-500 text-xs font-normal">
                  orders
                </span>
              </h4>
            </div>
          </div> */}

          {/* Card 4: Current Logs */}
          <div
            title="Count of logs currently matching your search query criteria"
            className="group relative bg-gradient-to-br from-[#11192e] via-[#0f1626]/80 to-[#070a13]/90 border border-slate-800/80 rounded-2xl p-4 sm:p-5 flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)] overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/10 transition-transform duration-300 group-hover:scale-110 shrink-0">
              <Activity size={20} className="sm:size-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] sm:text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-0.5">
                Current Logs
              </p>
              <h4 className="text-sm sm:text-base font-black text-white tracking-tight">
                {filteredOrders.length}{" "}
                <span className="text-slate-500 text-xs font-normal">
                  records
                </span>
              </h4>
            </div>
          </div>

          {/* Card 5: Gross Volume */}
          <div
            title="Aggregated cumulative pricing metric of all filtered items combined"
            className="group relative bg-gradient-to-br from-[#11192e] via-[#0f1626]/80 to-[#070a13]/90 border border-slate-800/80 rounded-2xl p-4 sm:p-5 flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)] overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/10 transition-transform duration-300 group-hover:scale-110 shrink-0">
              <DollarSign size={20} className="sm:size-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] sm:text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-0.5">
                Gross Vol
              </p>
              <h4 className="text-sm sm:text-base font-black text-emerald-400 font-mono tracking-tight">
                Rs. {totalVolume.toLocaleString()}
              </h4>
            </div>
          </div>

          {/* Card 6: Ticket Average */}
          {/* <div
            title="Calculated average cost generation metric per order token mapped"
            className="group relative bg-gradient-to-br from-[#11192e] via-[#0f1626]/80 to-[#070a13]/90 border border-slate-800/80 rounded-2xl p-4 sm:p-5 flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)] overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/10 transition-transform duration-300 group-hover:scale-110 shrink-0">
              <TrendingUp size={20} className="sm:size-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] sm:text-xs uppercase font-extrabold text-slate-400 tracking-wider mb-0.5">
                Ticket Avg
              </p>
              <h4 className="text-sm sm:text-base font-black text-purple-400 font-mono tracking-tight">
                Rs. {averageTicket.toLocaleString()}
              </h4>
            </div>
          </div> */}
        </div>

        {/* Action Confirmation Modal */}
        <AnimatePresence>
          {actionModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#0f1626] border border-slate-800 rounded-2xl p-5 max-w-sm w-full shadow-2xl relative overflow-hidden"
              >
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div
                    className={`p-2 rounded-lg ${actionModal.status === "Accepted" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}
                  >
                    <AlertTriangle size={18} />
                  </div>
                  <h3 className="text-sm font-black text-white">
                    Confirm Action
                  </h3>
                </div>
                <p className="text-xs text-slate-400 text-center leading-relaxed mb-5">
                  Are you sure you want to mark this execution record as{" "}
                  <span
                    className={
                      actionModal.status === "Accepted"
                        ? "text-emerald-400 font-bold"
                        : "text-rose-400 font-bold"
                    }
                  >
                    {actionModal.status.toUpperCase()}
                  </span>
                  ? This decision framework updates live metrics.
                </p>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => setActionModal(null)}
                    title="Dismiss action configuration without changes"
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold cursor-pointer transition-colors duration-150"
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={() =>
                      updateOrderStatus(actionModal.id, actionModal.status)
                    }
                    title={`Authorize and commit ${actionModal.status.toUpperCase()} status transformation layout`}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black tracking-wider text-white cursor-pointer transition-all duration-150 ${
                      actionModal.status === "Accepted"
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500"
                        : "bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500"
                    }`}
                  >
                    CONFIRM {actionModal.status.toUpperCase()}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Operational Container */}
        <div className="w-full overflow-x-auto rounded-xl border border-slate-800/70 bg-[#0f1626] shadow-2xl custom-dashboard-scroll pb-1.5">
          <div className="min-w-[1200px]">
            {/* 6 Columns Heading Track */}
            <div className="grid grid-cols-6 gap-4 px-6 py-4 bg-[#0b0f19] border-b border-slate-800 text-[10px] uppercase font-black text-slate-500 tracking-wider select-none items-center text-center">
              <div className="text-left">Customer Profile</div>
              <div className="text-left pl-2">Contact Context</div>
              <div className="text-left pl-2">Location Block</div>
              <div>Order Bill</div>
              <div>View Details</div>
              <div>Decision Engine</div>
            </div>

            {/* Data Table Rows Matrix */}
            <div className="divide-y divide-slate-800/50">
              {filteredOrders.map((order) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  key={order._id}
                  className="grid grid-cols-6 gap-4 items-center px-6 py-4 hover:bg-[#131b2e]/40 transition-all duration-200 group relative overflow-hidden text-center"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-[2.5px] bg-gradient-to-b from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  {/* 1. Customer Profile */}
                  <div className="flex items-center gap-3 min-w-0 text-left">
                    <div className="p-2 bg-slate-800/60 border border-slate-700/30 rounded-lg text-blue-400 shrink-0">
                      <User size={14} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-white text-xs capitalize tracking-tight group-hover:text-blue-400 transition-colors duration-200 truncate">
                        {order.customerName}
                      </h3>
                      <span
                        className={`inline-block text-[8px] px-1.5 py-0.5 rounded-md font-bold tracking-wide mt-1 uppercase ${
                          order.status === "Accepted" || order.status === "accepted"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : order.status === "Rejected" || order.status === "rejected"
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {order.status || "Pending"}
                      </span>
                    </div>
                  </div>

                  {/* 2. Contact Number */}
                  <div className="flex items-center gap-1.5 text-slate-400 min-w-0 text-left pl-2">
                    <Phone size={11} className="text-slate-600 shrink-0" />
                    <span className="text-xs font-mono tracking-tight text-slate-300 truncate">
                      {order.phoneNumber}
                    </span>
                  </div>

                  {/* 3. Location Area */}
                  <div className="flex items-center gap-2 text-xs text-slate-300 font-medium text-left pl-2">
                    <MapPin size={11} className="text-rose-400/80 shrink-0" />
                    <span className="text-slate-400 leading-tight block break-words max-w-full">
                      {order.area},{" "}
                      <span className="text-slate-500 text-[10px] font-normal">
                        {order.city}
                      </span>
                    </span>
                  </div>

                  {/* 4. Order Bill Container */}
                  <div className="flex justify-center items-center min-w-0">
                    <p className="w-full max-w-[120px] text-xs font-black text-emerald-400 font-mono tracking-wide whitespace-nowrap bg-emerald-950/10 py-1.5 rounded-lg border border-emerald-900/10 text-center">
                      Rs. {Number(order.totalBill).toLocaleString()}
                    </p>
                  </div>

                  {/* 5. View Details Trigger Button */}
                  <div className="flex justify-center items-center min-w-0">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      title={`Inspect full itemization breakdown invoice details for ${order.customerName}`}
                      className="w-full max-w-[120px] py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/40 rounded-lg text-[10px] font-bold transition-all duration-150 cursor-pointer shadow-xs whitespace-nowrap text-center"
                    >
                      Details
                    </button>
                  </div>

                  {/* 6. Engine Controls Stack */}
                  <div className="flex items-center justify-center gap-2 w-full max-w-[160px] mx-auto">
                    <button
                      onClick={() =>
                        setActionModal({ id: order._id, status: "Rejected" })
                      }
                      title={`Refuse and reject order from ${order.customerName}`}
                      className="flex-1 py-1.5 bg-rose-950/30 text-rose-400 border border-rose-900/40 rounded-lg text-[10px] font-bold hover:bg-rose-900/50 transition-all duration-150 cursor-pointer tracking-wider text-center"
                    >
                      REJECT
                    </button>
                    <button
                      onClick={() =>
                        setActionModal({ id: order._id, status: "Accepted" })
                      }
                      title={`Approve and accept order from ${order.customerName}`}
                      className="flex-1 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black rounded-lg text-[10px] hover:from-emerald-500 hover:to-teal-500 shadow-sm transition-all duration-150 cursor-pointer tracking-wider text-center"
                    >
                      ACCEPT
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Details View Modal Container */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs"
          >
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                transition: { type: "spring", stiffness: 300, damping: 26 },
              }}
              exit={{
                opacity: 0,
                y: 30,
                scale: 0.95,
                transition: { duration: 0.15 },
              }}
              className="bg-[#0f1626] border border-slate-800 w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden max-h-[92vh] flex flex-col mb-0 sm:mb-auto"
            >
              <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

              <div className="flex justify-between items-center mb-3.5 border-b border-slate-800 pb-3 shrink-0">
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                  Client Record:{" "}
                  <span className="text-blue-400 font-mono capitalize font-bold tracking-tight">
                    {selectedOrder.customerName}
                  </span>
                </p>
                <button
                  onClick={() => setSelectedOrder(null)}
                  title="Close breakdown window overview"
                  className="p-1.5 hover:bg-slate-800/80 text-slate-400 hover:text-white rounded-full transition-all duration-150 cursor-pointer active:scale-90"
                  aria-label="Close Modal"
                >
                  <X size={16} className="stroke-[2]" />
                </button>
              </div>

              <div className="overflow-y-auto pr-1 custom-dashboard-scroll flex-1 space-y-3.5">
                <div className="bg-[#070a13]/90 border border-slate-800/80 rounded-xl p-3 flex items-start gap-2.5 shadow-inner">
                  <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg shrink-0 mt-0.5 border border-rose-500/10">
                    <Home size={13} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] uppercase font-black text-slate-500 tracking-widest mb-0.5">
                      Full Delivery Address
                    </p>
                    <p className="text-[11px] sm:text-xs text-slate-200 leading-relaxed font-medium break-words">
                      {selectedOrder.area},{" "}
                      <span className="text-slate-400">
                        {selectedOrder.city}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 max-h-[35vh] sm:max-h-[40vh] overflow-y-auto pr-0.5 custom-dashboard-scroll">
                  {selectedOrder.items?.map((item, i) => (
                    <div
                      key={i}
                      className="bg-[#070a13]/40 p-3 rounded-xl border border-slate-800/50 hover:border-slate-800 transition-colors duration-150"
                    >
                      <div className="flex gap-3">
                        <img
                          src={item.img}
                          alt={item.name}
                          className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg object-cover ring-1 ring-slate-800/80 shrink-0 bg-slate-900"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <p className="text-[11px] sm:text-xs font-bold text-white truncate max-w-[70%]">
                              {item.quantity}x {item.name}
                            </p>
                            <p className="text-[11px] sm:text-xs font-black text-emerald-400 font-mono shrink-0">
                              Rs. {Number(item.totalPrice).toLocaleString()}
                            </p>
                          </div>

                          <div className="mt-1.5 space-y-0.5 border-t border-slate-900/60 pt-1.5">
                            {item.selectedSize && (
                              <p className="text-[10px] text-blue-400 font-medium">
                                ↳ Size: {item.selectedSize.name} (+Rs.{" "}
                                {item.selectedSize.price})
                              </p>
                            )}
                            {item.extras?.map((ex, idx) => (
                              <p
                                key={idx}
                                className="text-[10px] text-rose-400 font-medium"
                              >
                                ↳ Extra: {ex.name} (+Rs. {ex.price})
                              </p>
                            ))}
                            {item.addons?.map((ad, idx) => (
                              <p
                                key={idx}
                                className="text-[10px] text-amber-400 font-medium"
                              >
                                ↳ Addon: {ad.name} (+Rs. {ad.price})
                              </p>
                            ))}

                            {item.instructions &&
                              item.instructions.trim() !== "" && (
                                <div className="text-[9px] text-indigo-300 bg-indigo-950/30 p-2 rounded-md mt-1.5 border border-indigo-900/10 leading-normal w-full min-w-0 overflow-hidden">
                                  <span className="font-bold text-indigo-400 uppercase tracking-wide text-[8px] block mb-0.5">
                                    Special Instructions Note:
                                  </span>
                                  <p className="break-all break-words whitespace-pre-wrap text-slate-300">
                                    {item.instructions}
                                  </p>
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 space-y-2 shrink-0">
                <div className="flex justify-between text-[11px] sm:text-xs text-slate-400">
                  <span>Live Surcharge:</span>
                  <span className="font-mono text-slate-200 font-medium">
                    Rs. {Number(selectedOrder.deliveryFee).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px] sm:text-xs text-slate-400">
                  <span>Method Strategy:</span>
                  <span className="font-black text-slate-200 uppercase text-[8px] sm:text-[9px] bg-slate-800 border border-slate-700/50 px-2 py-0.5 rounded-md tracking-wider">
                    {selectedOrder.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between pt-2.5 border-t border-slate-800 items-center">
                  <span className="font-bold text-xs sm:text-sm text-slate-400">
                    Aggregate Total Bill:
                  </span>
                  <span className="font-black text-sm sm:text-base text-emerald-400 font-mono">
                    Rs. {Number(selectedOrder.totalBill).toLocaleString()}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}