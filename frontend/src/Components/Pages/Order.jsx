import React, { useState, useEffect } from "react";
import { DELIVERY_FEE } from "../../Contants/Config";
import axios from "axios";
import {
  CheckCircle2,
  XCircle,
  Trash2,
  X,
  Loader2,
  CalendarDays,
  MapPin,
  Check,
} from "lucide-react";
import Swal from "sweetalert2";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [showClearAllPopup, setShowClearAllPopup] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/myorders`, {
        withCredentials: true,
      });
      const sortedOrders = (res.data.orders || res.data).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
      setOrders(sortedOrders);
      setLoading(false);
    } catch (err) {
      console.error("Error loading orders", err);
      setLoading(false);
    }
  };

  const confirmDeleteOrder = async () => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/orders/${orderToDelete}`,
        {
          withCredentials: true,
        },
      );
      setOrders(orders.filter((order) => order._id !== orderToDelete));
      setShowDeletePopup(false);

      Swal.fire({
        position: "center",
        icon: "success",
        title: "Order Deleted!",
        showConfirmButton: false,
        timer: 1500,
        background: "#22c55e",
        color: "#fff",
      });
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const confirmClearAll = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/myorders/clear-all`, {
        withCredentials: true,
      });
      setOrders([]);
      setShowClearAllPopup(false);

      Swal.fire({
        position: "center",
        icon: "success",
        title: "History Cleared!",
        showConfirmButton: false,
        timer: 1500,
        background: "#22c55e",
        color: "#fff",
      });
    } catch (err) {
      console.error("Clear all failed", err);
    }
  };

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white">
        <Loader2 className="w-16 h-16 animate-spin text-[#ff4f1d] mb-5" />
        <p className="font-extrabold text-xs tracking-widest uppercase text-gray-500 animate-pulse">
          Retrieving Order History...
        </p>
      </div>
    );
  }

  const renderStatusBadge = (status) => {
    const baseClass =
      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider";

    const s = status ? status.toLowerCase() : "";

    if (s === "delivered" || s === "completed" || s === "accepted") {
      return (
        <span className={`${baseClass} bg-green-100 text-green-700`}>
          {status} <Check size={13} strokeWidth={3} />
        </span>
      );
    }

    if (s === "rejected" || s === "cancelled") {
      return (
        <span className={`${baseClass} bg-red-200 text-red-700`}>
          {status} <XCircle size={13} />
        </span>
      );
    }

    return (
      <span className={`${baseClass} bg-orange-100 text-orange-700`}>
        {status}{" "}
        <div className="w-2 h-2 rounded-full bg-orange-600 animate-pulse" />
      </span>
    );
  };

  <button
    onClick={() => openOrderDetails(order)}
    className="px-6 py-3 bg-gray-950 hover:bg-black/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl cursor-pointer"
  >
    View Details
  </button>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10 pb-4 border-b border-gray-100">
          <h2 className="relative text-xl md:text-4xl font-black italic uppercase tracking-tighter text-gray-950 inline-block after:content-[''] after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-2 after:bg-[#ff4f1d] after:rounded-full">
            Order History
          </h2>
          {orders.length > 0 && (
            <button
              title="Clear all order history"
              onClick={() => setShowClearAllPopup(true)}
              className="flex items-center gap-2 px-2 py-2 md:px-5 md:py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-xs cursor-pointer hover:bg-red-600 hover:text-white hover:shadow-lg transition-all"
            >
              <Trash2 size={17} /> Clear History
            </button>
          )}
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl shadow-sm border border-gray-100">
            <p className="text-gray-400 font-bold">
              No orders found. Time to order something!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const firstItem = order.items?.[0] || {};
              const isPending = order.status === "Pending";

              return (
                <div
                  key={order._id}
                  className="relative bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-[#ff4f1d]/20 transition-all duration-300"
                >
                  {isPending && (
                    <button
                      title="Delete this order"
                      onClick={() => {
                        setOrderToDelete(order._id);
                        setShowDeletePopup(true);
                      }}
                      className="absolute top-4 right-4 p-2.5 bg-red-50 text-red-500 rounded-xl cursor-pointer hover:bg-red-600 hover:text-white hover:-translate-y-0.5 hover:rotate-6 transition-all active:scale-90 z-10"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}

                  <div className="flex flex-col md:flex-row p-6 gap-6">
                    <div className="flex-1 flex gap-5 items-center md:border-r md:border-dashed md:border-gray-100 md:pr-6">
                      <img
                        src={
                          firstItem.image ||
                          "https://placehold.co/60x60?text=Food"
                        }
                        alt={firstItem.name}
                        className="w-20 h-20 object-cover rounded-2xl bg-gray-50 p-1"
                        onError={(e) => {
                          e.target.src =
                            "https://placehold.co/60x60?text=No+Img";
                        }}
                      />
                      <div className="space-y-1">
                        {renderStatusBadge(order.status)}
                        <h3 className="font-black text-gray-900 text-lg leading-tight mt-2">
                          {firstItem.name}
                        </h3>
                        <p className="text-xs text-gray-400 font-medium">
                          {firstItem.selectedSize?.name || "Standard"}
                        </p>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-center space-y-3">
                      <div className="flex items-center gap-2 text-gray-600 text-sm font-medium">
                        <CalendarDays size={16} className="text-[#ff4f1d]" />
                        {new Date(order.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                        })}
                        ,
                        {new Date(order.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 text-sm font-medium">
                        <MapPin size={16} className="text-[#ff4f1d]" />{" "}
                        {order.city}, {order.area}
                      </div>
                    </div>

                    <div className="flex-[0.8] flex flex-col">
                      <div className="w-full flex justify-between md:hidden  items-center">
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                          Total Price
                        </p>

                        <p className="text-[15px] font-black text-gray-950 md:mt-1">
                          Rs. {order.totalBill || order.total}
                        </p>
                      </div>

                      <div className="hidden md:flex justify-center mt-4">
                        <button
                          title="See full order details"
                          onClick={() => openOrderDetails(order)}
                          className="px-6 py-3 bg-gray-950 text-white text-[10px] font-black uppercase tracking-widest rounded-xl cursor-pointer hover:bg-black hover:shadow-lg transition-all"
                        >
                          View Details
                        </button>
                      </div>

                      <div className="md:hidden mt-4">
                        <button
                          title="See full order details"
                          onClick={() => openOrderDetails(order)}
                          className="w-full px-2 py-3 bg-gray-950 text-white text-[10px] font-black uppercase tracking-widest rounded-xl cursor-pointer hover:bg-black hover:shadow-lg transition-all"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showDeletePopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xs rounded-3xl p-7 text-center shadow-2xl scale-in-center">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5 animate-bounce">
              {" "}
              <Trash2 size={30} />{" "}
            </div>
            <h3 className="text-2xl font-black text-gray-950 mb-2">
              Delete Order?
            </h3>
            <p className="text-gray-500 text-sm font-medium mb-7">
              Are you sure you want to cancel this order? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeletePopup(false)}
                className="flex-1 py-3.5 bg-gray-100 text-gray-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-200 cursor-pointer transition-all"
              >
                {" "}
                No{" "}
              </button>
              <button
                onClick={confirmDeleteOrder}
                className="flex-1 py-3.5 bg-red-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-red-200 hover:bg-red-700 cursor-pointer transition-all active:scale-95"
              >
                {" "}
                Yes{" "}
              </button>
            </div>
          </div>
        </div>
      )}

      {showClearAllPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xs rounded-3xl p-7 text-center shadow-2xl scale-in-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-5 animate-pulse">
              {" "}
              <XCircle size={30} />{" "}
            </div>
            <h3 className="text-2xl font-black text-gray-950 mb-2">
              Clear History?
            </h3>
            <p className="text-gray-500 text-sm font-medium mb-7">
              Clear all order history? This action cannot be undone!
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearAllPopup(false)}
                className="flex-1 py-3.5 bg-gray-100 text-gray-600 rounded-xl font-bold text-xs uppercase tracking-widest cursor-pointer hover:bg-gray-200 transition-all"
              >
                {" "}
                Cancel{" "}
              </button>
              <button
                onClick={confirmClearAll}
                className="flex-1 py-3.5 bg-red-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-red-200 cursor-pointer hover:bg-red-700 transition-all active:scale-95"
              >
                {" "}
                Clear All{" "}
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-[9999] flex items-center md:items-center p-3 justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-5xl rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-4 md:px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <h3 className="font-bold text-gray-900 text-sm md:text-lg">
                  Order Details
                </h3>

                <p className="text-[14px] text-gray-500 md:border-l md:pl-3 border-gray-300">
                  {new Date(selectedOrder.createdAt).toLocaleDateString()}
                </p>

                <p className="text-sm font-bold text-green-600 md:border-l md:pl-3 border-gray-300">
                  {selectedOrder.status || "Delivered"}
                </p>

                <p className="text-sm text-gray-500 md:border-l md:pl-3 border-gray-300">
                  {selectedOrder.city} - {selectedOrder.area}
                </p>
              </div>
              <button
                title="Close"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 cursor-pointer hover:text-red-500 transition-colors"
              >
                <X size={22} />
              </button>
            </div>

            <div className="p-0  md:p-4">
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[13px] text-gray-900 border-b border-gray-100">
                      <th className="pb-3 font-bold px-2">Item Image</th>
                      <th className="pb-3 font-bold">Name</th>
                      <th className="pb-3 font-bold text-center px-4 border-l border-gray-100">
                        Size
                      </th>
                      <th className="pb-3 font-bold text-center px-4 border-l border-gray-100">
                        Add-ons
                      </th>
                      <th className="pb-3 font-bold text-center px-4 border-l border-gray-100">
                        Extra
                      </th>
                      <th className="pb-3 font-bold text-center border-l border-gray-100">
                        Qty
                      </th>
                      <th className="pb-3 font-bold px-4">Price</th>
                      <th className="pb-3 font-bold text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {selectedOrder.items?.map((item, i) => (
                      <tr key={i} className="text-[13px] text-gray-700">
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-300 text-xs">
                              {i + 1}
                            </span>
                            <img
                              src={
                                item.image ||
                                "https://placehold.co/60x60?text=Food"
                              }
                              alt={item.name}
                              className="w-12 h-12 rounded-lg object-cover border"
                              onError={(e) => {
                                e.target.src =
                                  "https://placehold.co/60x60?text=Error";
                              }}
                            />
                          </div>
                        </td>
                        <td className="py-4 font-bold text-gray-900">
                          {item.name}
                        </td>
                        <td className="py-4 text-center px-4">
                          <div className="font-medium text-[11px]">
                            {item.selectedSize?.name || "N/A"}
                          </div>
                        </td>

                        <td className="py-4 text-center px-4 border-l border-gray-50">
                          {item.addons?.length > 0
                            ? item.addons.map((a, idx) => (
                                <div key={idx} className="text-[11px]">
                                  {a.name}{" "}
                                  <span className="text-gray-600">
                                    (Rs.{a.price})
                                  </span>
                                </div>
                              ))
                            : "N/A"}
                        </td>
                        <td className="py-4 text-center px-4 border-l border-gray-50">
                          {item.extras?.length > 0
                            ? item.extras.map((e, idx) => (
                                <div key={idx} className="text-[11px]">
                                  {e.name}{" "}
                                  <span className="text-gray-600">
                                    (Rs.{e.price})
                                  </span>
                                </div>
                              ))
                            : "N/A"}
                        </td>
                        <td className="py-4 text-center border-l border-gray-50">
                          {item.quantity}
                        </td>
                        <td className="py-4 px-4">Rs. {item.price}</td>
                        <td className="py-4 text-right font-bold text-gray-900">
                          Rs. {item.totalPrice || item.price * item.quantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden divide-y  divide-gray-100">
                {selectedOrder.items?.map((item, i) => (
                  <div key={i} className="p-4 space-y-3">
                    <div className="flex gap-3">
                      <img
                        src={item.image}
                        className="w-16 h-16 rounded-xl object-cover border"
                      />
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity} × Rs. {item.price}
                        </p>
                      </div>
                      <div className="text-right font-bold text-orange-600">
                        Rs. {item.price * item.quantity}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center bg-gray-50 p-2 rounded-lg text-[11px]">
                      <div className="border-r border-gray-200">
                        <p className="font-bold text-gray-400 uppercase">
                          Size
                        </p>

                        <p className="text-gray-800">
                          {item.size?.name || "N/A"}
                        </p>

                        {item.size?.extraPrice > 0 && (
                          <p className="text-gray-400">
                            Rs. {item.size.extraPrice}
                          </p>
                        )}
                      </div>
                      <div className="border-r border-gray-200">
                        <p className="font-bold text-gray-400 uppercase">
                          Addons
                        </p>
                        {item.addons?.length > 0
                          ? item.addons.map((a, idx) => (
                              <p key={idx}>
                                {a.name}{" "}
                                <span className="text-gray-400">
                                  ({a.price})
                                </span>
                              </p>
                            ))
                          : "N/A"}
                      </div>
                      <div>
                        <p className="font-bold text-gray-400 uppercase">
                          Extras
                        </p>
                        {item.extras?.length > 0
                          ? item.extras.map((e, idx) => (
                              <p key={idx}>
                                {e.name}{" "}
                                <span className="text-gray-400">
                                  ({e.price})
                                </span>
                              </p>
                            ))
                          : "N/A"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-gray-50 md:bg-transparent border-t md:border-0">
                <div className="flex flex-col items-end gap-2">
                  <div className="flex justify-between w-full md:w-52 text-sm">
                    <span className="text-gray-500">Delivery Fee</span>
                    <span className="font-bold text-gray-900">
                      Rs. {selectedOrder.deliveryFee ?? DELIVERY_FEE}
                    </span>
                  </div>
                  <div className="flex justify-between w-full md:w-52 border-t border-gray-200 pt-2">
                    <span className="text-lg font-black text-gray-900">
                      Total
                    </span>
                    <span className="text-xl font-black text-[#ff4f1d]">
                      Rs. {selectedOrder.totalBill || selectedOrder.total}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
