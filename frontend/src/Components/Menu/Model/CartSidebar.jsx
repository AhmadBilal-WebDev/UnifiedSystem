import React, { useState, useEffect } from "react";
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { DELIVERY_FEE, FREE_DELIVERY_TEXT } from "../../../Contants/Config";

const CartSidebar = ({
  showCartSidebar,
  setShowCartSidebar,
  cartItems,
  setCartItems,
  cartStats,
  setCartStats,
  handlePlaceOrder,
}) => {
  const [expandedItems, setExpandedItems] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    itemId: null,
  });

  useEffect(() => {
    if (showCartSidebar) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showCartSidebar]);

  const toggleExpand = (id) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const removeItem = (uniqueCartId) => {
    const updatedCart = cartItems.filter(
      (item) => item.uniqueCartId !== uniqueCartId,
    );

    setCartItems(updatedCart);

    const total = updatedCart.reduce(
      (acc, item) => acc + (Number(item.totalPrice) || 0),
      0,
    );
    setCartStats({ count: updatedCart.length, total: total });

    localStorage.setItem("cartItems", JSON.stringify(updatedCart));

    window.dispatchEvent(new Event("cartUpdated"));
    setDeleteConfirm({ show: false, itemId: null });
  };

  const updateQuantity = (uniqueCartId, type) => {
    const updatedCart = cartItems.map((item) => {
      if (item.uniqueCartId === uniqueCartId) {
        const newQty =
          type === "inc" ? item.quantity + 1 : Math.max(1, item.quantity - 1);

        const unitPrice = item.totalPrice / item.quantity;

        return {
          ...item,
          quantity: newQty,
          totalPrice: unitPrice * newQty,
        };
      }
      return item;
    });

    setCartItems(updatedCart);

    localStorage.setItem("cartItems", JSON.stringify(updatedCart));

    window.dispatchEvent(new Event("cartUpdated"));
  };

  const DetailBar = ({ label, value, qty = "1x" }) => (
    <div className="relative pl-7 mb-4 last:mb-0">
      <div
        className="absolute left-[5px] top-[5px] bottom-0 w-[2px]"
        style={{ backgroundColor: "var(--carts-bg-color)", opacity: 0.15 }}
      ></div>
      <div
        className="absolute left-0.5 top-[6px] w-2.5 h-2.5 rounded-full"
        style={{ backgroundColor: "var(--carts-bg-color)" }}
      ></div>

      <p
        className="font-extrabold text-[10px] mb-1 mt-2 uppercase tracking-wide"
        style={{ color: "var(--carts-bg-color)" }}
      >
        {label}
      </p>

      <div className="flex items-center gap-3 ml-1  rounded-full px-4 py-2 ">
        <div
          className="w-2 mt-1 h-2 rounded-full"
          style={{ backgroundColor: "var(--carts-bg-color)", opacity: 0.5 }}
        ></div>
        {qty && (
          <span
            className="font-extrabold text-[14px]"
            style={{ color: "var(--carts-bg-color)" }}
          >
            {qty}
          </span>
        )}
        <span className="text-slate-700 text-[12px] font-semibold">
          {value}
        </span>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {showCartSidebar && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCartSidebar(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-[4px] z-[9998]"
          />

          <AnimatePresence>
            {deleteConfirm.show && (
              <div className="fixed inset-0 z-[10001] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  className="bg-white rounded-3xl p-8 shadow-2xl w-full max-w-sm text-center border border-gray-100"
                >
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 bg-red-50">
                    <Trash2
                      size={36}
                      style={{ color: "var(--carts-bg-color)" }}
                    />
                  </div>
                  <h3 className="text-2xl font-black mb-2">Are you sure?</h3>
                  <p className="text-gray-500 text-base mb-8 font-medium">
                    Do you really want to remove this item from your cart?
                  </p>
                  <div className="flex gap-4">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() =>
                        setDeleteConfirm({ show: false, itemId: null })
                      }
                      className="flex-1 py-4 rounded-2xl font-bold bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => removeItem(deleteConfirm.itemId)}
                      className="flex-1 py-4 rounded-2xl font-bold text-white transition-opacity hover:opacity-90 cursor-pointer shadow-lg"
                      style={{ backgroundColor: "var(--carts-bg-color)" }}
                    >
                      Remove
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="fixed top-0 right-0 h-screen w-full sm:w-[420px] bg-white z-[9999] shadow-[-10px_0_30px_rgba(0,0,0,0.1)] flex flex-col text-[#2d2d2d]"
          >
            <div
              className="flex items-center justify-between px-6 py-6 text-white shadow-md"
              style={{ backgroundColor: "var(--carts-bg-color)" }}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <ShoppingBag size={24} />
                </motion.div>
                <h2 className="text-xl font-black tracking-tight uppercase">
                  Your Cart
                </h2>
              </div>
              <motion.button
                whileHover={{ rotate: 90 }}
                whileTap={{ scale: 0.8 }}
                title="Close"
                onClick={() => {
                  setShowCartSidebar(false);
                  window.dispatchEvent(new Event("cartClosed"));
                }}
                className="bg-white/20 hover:bg-white/30 transition-colors p-2 rounded-full cursor-pointer"
              >
                <X size={20} strokeWidth={3} />
              </motion.button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 mb-2">
              <LayoutGroup>
                {cartItems.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 0.4, y: 0 }}
                    className="h-full flex flex-col items-center justify-center p-10 text-center"
                  >
                    <ShoppingBag size={60} strokeWidth={1.5} />
                    <p className="mt-4 font-bold text-black tracking-wider uppercase">
                      Your cart is empty
                    </p>
                  </motion.div>
                ) : (
                  cartItems.map((item, index) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      key={item.uniqueCartId}
                      className="bg-white rounded-3xl border border-gray-100 p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)] transition-all duration-300"
                    >
                      <div className="flex gap-4">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="relative shrink-0"
                        >
                          <img
                            src={item.img}
                            alt={item.name}
                            className="w-17 h-17 object-contain rounded-2xl bg-gray-50 border border-gray-50"
                          />
                        </motion.div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-extrabold mt-2 text-[14px] text-[#1a1a1a] leading-tight truncate">
                                {item.name}
                              </h3>
                              <span className="font-black text-sm block mt-1 text-[#1a1a1a]">
                                Rs.{" "}
                                {item.selectedSize?.price?.toLocaleString() ||
                                  item.price?.toLocaleString()}
                              </span>
                            </div>

                            <div className="flex flex-col items-end gap-2 shrink-0">
                              <div className="flex items-center bg-gray-50 rounded-full p-1 border border-gray-100 shadow-sm">
                                <motion.button
                                  whileTap={{ scale: 0.8 }}
                                  title="Decrease Quantity"
                                  onClick={() =>
                                    updateQuantity(item.uniqueCartId, "dec")
                                  }
                                  className="p-1.5 hover:bg-black/5 rounded-full transition-colors cursor-pointer"
                                  style={{ color: "var(--carts-bg-color)" }}
                                >
                                  <Minus size={12} strokeWidth={3} />
                                </motion.button>
                                <span
                                  className="w-6 text-center font-bold text-sm"
                                  style={{ color: "var(--carts-bg-color)" }}
                                >
                                  {item.quantity}
                                </span>
                                <motion.button
                                  whileTap={{ scale: 0.8 }}
                                  title="Increase Quantity"
                                  onClick={() =>
                                    updateQuantity(item.uniqueCartId, "inc")
                                  }
                                  className="p-1.5 hover:bg-black/5 rounded-full transition-colors cursor-pointer"
                                  style={{ color: "var(--carts-bg-color)" }}
                                >
                                  <Plus size={12} strokeWidth={3} />
                                </motion.button>
                              </div>

                              <motion.button
                                whileTap={{ scale: 0.8 }}
                                title="Remove Item"
                                onClick={() =>
                                  setDeleteConfirm({
                                    show: true,
                                    itemId: item.uniqueCartId,
                                  })
                                }
                                className="text-red-500 hover:bg-red-50 p-2  rounded-full transition-colors cursor-pointer"
                              >
                                <Trash2 size={16} />
                              </motion.button>
                            </div>
                          </div>

                          <div className="-mt-2 flex flex-col">
                            <AnimatePresence>
                              {expandedItems[item.uniqueCartId] && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden mb-3 space-y-2"
                                >
                                  {item.selectedSize && (
                                    <DetailBar
                                      label="Size"
                                      value={
                                        item.selectedSize.name ||
                                        item.selectedSize.Label
                                      }
                                      qty=""
                                    />
                                  )}

                                  {item.extras?.map((ex, idx) => (
                                    <DetailBar
                                      key={`ex-${idx}`}
                                      label="Extras"
                                      value={ex.name || ex}
                                      qty=""
                                    />
                                  ))}

                                  {item.addons?.map((ad, idx) => (
                                    <DetailBar
                                      key={`ad-${idx}`}
                                      label="Add-ons"
                                      value={ad.name || ad}
                                      qty=""
                                    />
                                  ))}

                                  {item.instructions && (
                                    <DetailBar
                                      label="Special Notes"
                                      value={item.instructions}
                                      qty=""
                                    />
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* Toggle Expand Button */}
                            <motion.button
                              title="View All"
                              whileHover={{ x: 5 }}
                              onClick={() => toggleExpand(item.uniqueCartId)}
                              className="flex items-center gap-1 cursor-pointer font-bold text-[11px] uppercase tracking-wider hover:opacity-80 transition-all w-fit"
                              style={{ color: "var(--carts-bg-color)" }}
                            >
                              {expandedItems[item.uniqueCartId]
                                ? "Hide Details"
                                : "View Details"}
                              {expandedItems[item.uniqueCartId] ? (
                                <ChevronUp size={14} />
                              ) : (
                                <ChevronDown size={14} />
                              )}
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </LayoutGroup>
            </div>

            <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#fcf4d9] border border-[#ffecb3] text-[#856404] text-[11px] py-2 px-4 rounded-xl mb-4 text-center font-bold uppercase tracking-tighter"
              >
                {FREE_DELIVERY_TEXT}
              </motion.div>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between items-center text-[15px]">
                  <span className="text-slate-700 font-bold uppercase text-[12px] tracking-tight">
                    Subtotal
                  </span>
                  <span className="text-black font-medium">
                    Rs. {cartStats.total?.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[15px] pb-3">
                  <span className="text-slate-700 font-bold uppercase text-[12px] tracking-tight">
                    Delivery
                  </span>
                  <span className="text-black font-medium">
                    Rs. {DELIVERY_FEE.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-dashed border-gray-200">
                  <span className="text-lg font-black text-black uppercase italic">
                    Grand total
                  </span>
                  <span className="text-xl font-black text-black">
                    Rs.{" "}
                    {(
                      Number(cartStats.total) + Number(DELIVERY_FEE)
                    ).toLocaleString()}
                  </span>
                </div>
              </div>

              <motion.button
                title="Checkout your Card"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePlaceOrder}
                disabled={cartItems.length === 0}
                className={`relative overflow-hidden   w-full text-white py-3 rounded-[13px] font-black flex items-center justify-center gap-2 transition-all shadow-xl uppercase tracking-widest group ${cartItems.length === 0 ? "opacity-50 cursor-not-allowed grayscale" : "cursor-pointer"}`}
                style={{ backgroundColor: "var(--carts-bg-color)" }}
              >
                {cartItems.length > 0 && (
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{
                      repeat: Infinity,
                      duration: 2,
                      ease: "linear",
                      repeatDelay: 1,
                    }}
                    className="absolute inset-0 w-1/2 h-full skew-x-[-25deg] bg-gradient-to-r from-transparent via-white/40 to-transparent"
                  />
                )}

                <span className="relative z-10  flex items-center gap-2">
                  Checkout
                  <motion.div
                    animate={cartItems.length > 0 ? { x: [0, 5, 0] } : {}}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <ArrowRight size={22} strokeWidth={3} />
                  </motion.div>
                </span>
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartSidebar;
