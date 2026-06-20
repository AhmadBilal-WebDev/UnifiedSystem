import React, { useState, useEffect } from "react";
import { Plus, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { section_bg_img, DELIVERY_FEE } from "../../Contants/Config";
import AddressModal from "./Model/AddChange";
import axios from "axios";

const ConfirmOrder = ({ onBack, onConfirm }) => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  const [cartItems, setCartItems] = useState([]);
  const [cartStats, setCartStats] = useState({ count: 0, total: 0 });
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [address, setAddress] = useState("");
  const [savedLocation, setSavedLocation] = useState(null);
  const [loginRequiredPopup, setLoginRequiredPopup] = useState(false);
  useEffect(() => {
    const syncLocation = () => {
      const loc = localStorage.getItem("userLocation");
      if (loc) {
        setSavedLocation(JSON.parse(loc));
      }
    };

    syncLocation();
    window.addEventListener("locationUpdated", syncLocation);
    return () => window.removeEventListener("locationUpdated", syncLocation);
  }, []);

  const [selectedPayment, setSelectedPayment] = useState("cod");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    mobileNumber: "",
    email: "",
    deliveryTime: "",
  });

  useEffect(() => {
    const syncCart = () => {
      const saved = JSON.parse(localStorage.getItem("cartItems")) || [];
      setCartItems(saved);
      const total = saved.reduce(
        (acc, item) => acc + Number(item.totalPrice || 0),
        0,
      );
      setCartStats({
        count: saved.length,
        total,
      });
    };

    syncCart();
    window.addEventListener("cartUpdated", syncCart);
    window.addEventListener("storage", syncCart);

    return () => {
      window.removeEventListener("cartUpdated", syncCart);
      window.removeEventListener("storage", syncCart);
    };
  }, []);

  const handlePaymentSelect = (method) => {
    setSelectedPayment(method);
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  const handleInputChange = (e, field) => {
    setFormData({ ...formData, [field]: e.target.value });
    if (errors[field]) setErrors({ ...errors, [field]: "" });
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Name is required";
    if (!formData.mobileNumber || !/^\d{10,11}$/.test(formData.mobileNumber))
      newErrors.mobileNumber = "Valid mobile number required";
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email";

    if (!address.trim()) newErrors.address = "Please add your complete address";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = () => {
    if (validateForm()) {
      setShowConfirmPopup(true);
    }
  };

  const executeFinalOrder = async () => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    if (!userInfo || !userInfo._id) {
      setShowConfirmPopup(false);
      setLoginRequiredPopup(true);
      return;
    }

    setShowConfirmPopup(false);
    setLoading(true);

    try {
      const grandTotal = cartStats.total + DELIVERY_FEE;
      const orderPayload = {
        customerName: formData.fullName,
        phoneNumber: formData.mobileNumber,
        email: formData.email,
        registeredFromWebsite: window.location.origin,
        items: cartItems,
        totalBill: grandTotal,
        deliveryFee: DELIVERY_FEE,
        city: savedLocation?.city || "RenalaKhurd",
        area: `${savedLocation?.town || ""} — ${address}`,
        orderType: savedLocation?.type || "Delivery",
        deliveryTime: formData.deliveryTime,
        paymentMethod: selectedPayment,
        userId: userInfo._id,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/create`,
        orderPayload,
        { withCredentials: true },
      );

      if (response.data.success) {
        localStorage.removeItem("cartItems");
        localStorage.removeItem("cartStats");
        localStorage.removeItem("showFloatingBar");
        window.dispatchEvent(new Event("cartUpdated"));
        if (onConfirm) onConfirm(formData, selectedPayment);
        setShowSuccessPopup(true);
      } else {
        alert(response.data.message || "Order placing failed.");
      }
    } catch (error) {
      console.error("Order API Error:", error);
      alert(error.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen font-sans"
      style={{
        backgroundColor: "#fcfcfc",
        backgroundImage: `url(${section_bg_img})`,
        backgroundRepeat: "repeat",
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes slideBg {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: slideBg 3s linear infinite;
        }
        .btn-hover-effect {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .btn-hover-effect:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px -5px rgba(0,0,0,0.2);
        }
      `,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 py-6 min-h-screen">
        <div className="text-sm text-gray-500 mb-6 flex items-center gap-2 font-bold">
          <button
            title="Go Home"
            className="cursor-pointer hover:text-[#b91c1c] transition-all btn-hover-effect"
            onClick={() => {
              window.dispatchEvent(new Event("cartUpdated"));
              navigate("/");
            }}
          >
            Home
          </button>
          <span>&rsaquo;</span>
          <span className="text-[var(--carts-bg-color)] font-medium">
            Checkout
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px] max-w-[280px] space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    onChange={(e) => handleInputChange(e, "fullName")}
                    placeholder="Enter your name"
                    className={`w-full bg-white border ${errors.fullName ? "border-red-500" : "border-gray-200"} rounded-lg px-4 py-2.5 focus:border-[#b91c1c] outline-none text-sm transition-all`}
                  />
                  {errors.fullName && (
                    <p className="text-red-500 font-bold text-[10px] ml-1">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div className="flex-1 min-w-[250px] max-w-[320px] space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">
                    Mobile Number
                  </label>
                  <div
                    className={`flex gap-0 overflow-hidden border ${errors.mobileNumber ? "border-red-500" : "border-gray-200"} rounded-lg focus-within:border-[#b91c1c] transition-all`}
                  >
                    <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 border-r border-gray-200 min-w-[75px] shrink-0">
                      <img
                        src="https://flagcdn.com/w20/pk.png"
                        width="20"
                        alt="PK"
                      />
                      <span className="text-sm text-black">+92</span>
                    </div>
                    <input
                      type="tel"
                      onChange={(e) => handleInputChange(e, "mobileNumber")}
                      placeholder="03001234567"
                      className="w-full bg-white px-3 py-2.5 outline-none text-sm"
                    />
                  </div>
                  {errors.mobileNumber && (
                    <p className="text-red-500 font-bold text-[10px] ml-1">
                      {errors.mobileNumber}
                    </p>
                  )}
                </div>

                <div className="flex-1 min-w-[200px] max-w-[280px] space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    onChange={(e) => handleInputChange(e, "email")}
                    placeholder="Enter your email"
                    className={`w-full bg-white border ${errors.email ? "border-red-500" : "border-gray-200"} rounded-lg px-4 py-2.5 focus:border-[#b91c1c] outline-none text-sm transition-all`}
                  />
                  {errors.email && (
                    <p className="text-red-500 font-bold text-[10px] ml-1">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">
                  Your Address
                </label>
                <div>
                  <button
                    type="button"
                    onClick={() => setShowAddressModal(true)}
                    title="Add complete location"
                    className="mt-2 text-white px-5 py-2.5 rounded-lg font-bold transition-all text-xs uppercase tracking-wide btn-hover-effect cursor-pointer shadow-md active:scale-95"
                    style={{ backgroundColor: "var(--carts-bg-color)" }}
                  >
                    {address ? "Change Address" : "Add Address"}
                  </button>

                  {errors.address && (
                    <p className="text-red-500 text-[11px] font-bold mt-2 ml-1 italic">
                      {errors.address}
                    </p>
                  )}

                  {address && (
                    <p className="mt-3 text-[13px] font-bold text-[#b91c1c] bg-red-50 p-3 rounded-lg border-l-4 border-[#b91c1c] flex items-start gap-2 ">
                      <span className="shrink-0">📍</span>
                      <span>
                        {savedLocation
                          ? `${savedLocation.town}, ${savedLocation.city}`
                          : ""}
                        {address && " — "}
                        <span className="text-gray-700 font-medium italic">
                          {address}
                        </span>
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-3 text-gray-800">
                Estimated Delivery
              </h2>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-2xl">⚡</span>
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    Standard Delivery Time
                  </p>
                  <p className="text-xs text-gray-500 font-medium">
                    Your order will be delivered in approximately 40 minutes.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-5 text-gray-800">
                Select Payment Method
              </h2>
              <div className="flex flex-wrap gap-4">
                {[
                  {
                    id: "cod",
                    label: "Cash on Delivery",
                    icon: "https://cdn-icons-png.flaticon.com/512/2489/2489756.png",
                  },
                  {
                    id: "card_on_delivery",
                    label: "Swipe Card at Door",
                    icon: "https://cdn-icons-png.flaticon.com/512/8983/8983163.png",
                  },
                  {
                    id: "online_card",
                    label: "Pay Online Now",
                    icon: "https://cdn-icons-png.flaticon.com/512/349/349221.png",
                  },
                ].map((method) => (
                  <button
                    title="Choose payment method"
                    key={method.id}
                    onClick={() => handlePaymentSelect(method.id)}
                    className={`flex items-center justify-center gap-3 px-6 h-[60px] min-w-[200px] flex-1 sm:flex-none rounded-xl border-2 cursor-pointer btn-hover-effect ${
                      selectedPayment === method.id
                        ? "border-[var(--secondary-bg)] bg-white shadow-lg scale-[1.02]"
                        : "border-gray-100 bg-white shadow-sm"
                    }`}
                  >
                    <div className="w-10 h-7 flex-shrink-0">
                      <img
                        src={method.icon}
                        className="w-full h-full object-contain"
                        alt={method.label}
                      />
                    </div>
                    <span className="text-sm font-bold text-gray-800 whitespace-nowrap">
                      {method.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col bg-white">
            <h3 className="text-lg font-bold mb-6 text-gray-900 border-b pb-4">
              Your Cart
            </h3>
            <div
              className="space-y-6 mb-6 overflow-y-auto overflow-x-hidden"
              style={{
                maxHeight: "350px",
                msOverflowStyle: "none",
                scrollbarWidth: "none",
              }}
            >
              <style
                dangerouslySetInnerHTML={{
                  __html: `div::-webkit-scrollbar { display: none; }`,
                }}
              />
              {cartItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex gap-4 border-b border-gray-50 pb-4 last:border-0"
                >
                  <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 shadow-sm">
                    <img
                      src={item.img}
                      className="w-full h-full object-cover"
                      alt={item.name}
                    />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-bold text-[15px] text-gray-800 leading-tight">
                      {item.name}
                    </h4>
                    <div className="mt-1 space-y-0.5">
                      {item.selectedSize && (
                        <p className="text-[11px] text-gray-500 font-medium">
                          Size:{" "}
                          <span className="text-gray-800">
                            {item.selectedSize?.name || item.selectedSize}
                          </span>
                        </p>
                      )}

                      {item.extras?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          <span className="text-[11px] text-gray-500 font-medium">
                            Extras:
                          </span>
                          <span className="text-gray-800 text-[11px]">
                            {item.extras.map((ex, idx) => (
                              <span key={idx}>
                                {ex.name || ex}
                                {idx < item.extras.length - 1 ? ", " : ""}
                              </span>
                            ))}
                          </span>
                        </div>
                      )}

                      {item.addons?.length > 0 && (
                        <p className="text-[11px] text-gray-500 font-medium">
                          Add-ons:{" "}
                          <span className="text-gray-800">
                            {item.addons.map((a) => a.name || a).join(", ")}
                          </span>
                        </p>
                      )}

                      {item.instructions && (
                        <p className="text-[11px] text-gray-800 font-bold italic mt-1 line-clamp-1">
                          Note: {item.instructions}
                        </p>
                      )}
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <div className="border border-gray-200 rounded px-2 py-0.5 text-xs font-semibold text-gray-600">
                        x{item.quantity}
                      </div>
                      <p className="font-bold text-sm">
                        Rs. {Number(item.totalPrice || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-4 border-t border-gray-100">
              <button
                title="Add more items"
                onClick={() => {
                  window.dispatchEvent(new Event("cartUpdated"));
                  navigate("/");
                }}
                className="text-[var(--carts-bg-color)] w-fit mx-auto font-bold flex items-center gap-1 text-[14px] mb-3 border-b border-[var(--carts-bg-color)] border-dashed pb-0.5 hover:bg-transparent duration-300 cursor-pointer transition-all hover:scale-110 active:scale-95"
              >
                + Add more items
              </button>
              <div className="flex justify-between text-gray-500 text-sm font-medium">
                <span>Subtotal</span>
                <span>Rs. {cartStats.total.toLocaleString()}.00</span>
              </div>
              <div className="flex justify-between text-gray-500 text-sm font-medium">
                <span>Delivery Charges</span>
                <span>Rs. {DELIVERY_FEE.toLocaleString()}</span>
              </div>
              <div className="pt-4 flex justify-between items-center border-t border-gray-900 mt-4">
                <span className="text-[15px] font-black uppercase text-gray-900">
                  Grand total
                </span>
                <span className="text-lg font-black text-gray-900">
                  Rs. {(cartStats.total + DELIVERY_FEE).toLocaleString()}
                </span>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={loading || cartItems.length === 0}
                title={
                  cartItems.length === 0
                    ? "Your cart is empty"
                    : "Click to place your order"
                }
                className="relative overflow-hidden w-full mt-6 hover:scale-105 py-4 text-white rounded-xl font-bold uppercase cursor-pointer shadow-[0_4px_15px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.3)] active:scale-95 transition-all duration-300 text-sm flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group"
                style={{ backgroundColor: "var(--carts-bg-color, #b91c1c)" }}
              >
                <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-all duration-[1.5s] group-hover:left-[100%] ease-in-out" />

                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                  </>
                ) : cartItems.length === 0 ? (
                  "Cart is Empty"
                ) : (
                  "Place Order"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showConfirmPopup && (
          <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-xl"
            >
              <div className="flex justify-center mb-4">
                <AlertCircle size={50} className="text-orange-500" />
              </div>
              <h2 className="text-xl font-bold mb-2">Confirm Order?</h2>
              <p className="text-gray-600 text-sm mb-6">
                Are you sure you want to place this order?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmPopup(false)}
                  className="flex-1 py-3 bg-gray-100 rounded-xl font-bold cursor-pointer transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={executeFinalOrder}
                  className="flex-1 py-3 bg-[#b91c1c] text-white rounded-xl font-bold cursor-pointer shadow-lg transition-all active:scale-95"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSuccessPopup && (
          <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/60 p-4">
            <motion.div
              initial={{ scale: 0.8, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white w-full max-w-md rounded-[2rem] p-8 text-center shadow-2xl"
            >
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle size={60} className="text-green-500" />
                </div>
              </div>
              <h2 className="text-3xl font-black text-gray-800">
                Congratulations 🎉
              </h2>
              <p className="text-gray-500 mt-3 leading-relaxed">
                Your order has been placed successfully.
              </p>
              <button
                onClick={() => {
                  setShowSuccessPopup(false);
                  navigate("/");
                }}
                className="w-full mt-8 bg-[#ffc107] hover:bg-[#e0a800] text-black py-4 rounded-2xl font-black uppercase transition-all active:scale-95 cursor-pointer"
              >
                Continue
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {loginRequiredPopup && (
          <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-xl"
            >
              <div className="flex justify-center mb-4">
                <AlertCircle size={50} className="text-red-500" />
              </div>
              <h2 className="text-xl font-bold mb-2">Login Required</h2>
              <p className="text-gray-600 text-sm mb-6">
                Please login first to place your order.
              </p>
              <button
                onClick={() => {
                  setLoginRequiredPopup(false);
                }}
                className="w-full py-3 bg-[#b91c1c] text-white rounded-xl font-bold cursor-pointer transition-all active:scale-95"
              >
                Okay
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AddressModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        address={address}
        setAddress={setAddress}
      />
    </div>
  );
};

export default ConfirmOrder;
