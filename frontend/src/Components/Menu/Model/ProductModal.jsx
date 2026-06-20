import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, ChevronDown, CheckCircle2 } from "lucide-react";

const ProductModal = ({
  showModal,
  setShowModal,
  selectedItem,
  mainItemQty,
  setMainItemQty,
  addedExtras,
  setAddedExtras,
  addedAddons,
  setAddedAddons,
  openSection,
  setOpenSection,
  selectedSize,
  setSelectedSize,
  extrasList,
  addonsList,
  sizesList,
  handleFinalCheckout,
  toggleItem,
  calculateTotal,
  instructions,
  setInstructions,
}) => {
  const [sizeError, setSizeError] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showModal]);

  const onCheckoutClick = () => {
    if (!selectedSize) {
      setSizeError(true);
      setOpenSection("size");
      return;
    }
    setSizeError(false);

    setShowToast(true);
    handleFinalCheckout(instructions);

    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const toastElement = (
    <AnimatePresence>
      {showToast && (
        <div className="fixed inset-0 z-[99999] pointer-events-none flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="pointer-events-auto bg-white/95 backdrop-blur-sm border border-green-100 shadow-[0_15px_50px_rgba(0,0,0,0.2)] px-4 py-3 rounded-2xl flex items-center gap-3 min-w-[200px]"
          >
            <div className="bg-[var(--carts-bg-color)] p-1.5 rounded-full shadow-md shrink-0">
              <CheckCircle2 size={16} className="text-white" />
            </div>
            <div className="text-left">
              <p className="font-bold text-gray-900 text-xs leading-none">
                Added to Cart!
              </p>
              <p className="text-gray-500 text-[10px] mt-1 font-medium">
                Item added to your list.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (!selectedItem) return toastElement;

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 30,
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
    exit: { opacity: 0, scale: 0.9, y: 20, transition: { duration: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const shakeVariants = {
    shake: {
      x: [0, -5, 5, -5, 5, 0],
      transition: { duration: 0.4 },
    },
  };

  return (
    <>
      {toastElement}

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative bg-white w-full max-w-4xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-full sm:h-auto sm:max-h-[90vh]"
            >
              <button
                onClick={() => setShowModal(false)}
                title="Close"
                className="absolute right-4 top-4 z-[50] bg-white/80 backdrop-blur-md p-2 rounded-full shadow-lg border border-gray-100 hover:bg-red-50 hover:text-red-500 transition-all cursor-pointer active:scale-90"
              >
                <X size={24} />
              </button>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-full md:w-1/2 bg-[#f9f9f9] flex items-center justify-center p-6 shrink-0 md:shrink"
              >
                <motion.img
                  whileHover={{
                    scale: 1.1,
                    filter: "drop-shadow(0px 20px 30px rgba(0,0,0,0.1))",
                  }}
                  src={selectedItem.img}
                  alt={selectedItem.name}
                  className="w-full h-auto object-contain max-h-[130px] md:max-h-full transition-transform duration-500"
                />
              </motion.div>

              <div className="w-full md:w-1/2 flex flex-col flex-1 min-h-0">
                <div className="flex-grow overflow-y-auto p-6 md:p-8 custom-scrollbar">
                  <motion.div variants={itemVariants}>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                      {selectedItem.name}
                    </h2>
                    <p className="text-xl font-bold text-gray-800 mt-2">
                      from Rs. {selectedItem.price}
                    </p>
                  </motion.div>

                  <motion.p
                    variants={itemVariants}
                    className="text-gray-500 text-sm mt-4 leading-relaxed"
                  >
                    {selectedItem.desc ||
                      "Juicy and delicious item prepared with fresh ingredients and our secret signature sauce."}
                  </motion.p>

                  <div className="mt-8 space-y-3">
                    {sizesList.length > 0 && (
                    <motion.div
                      variants={sizeError ? shakeVariants : itemVariants}
                      animate={
                        sizeError
                          ? [
                              "shake",
                              {
                                boxShadow: [
                                  "0px 0px 0px rgba(239, 68, 68, 0)",
                                  "0px 0px 15px rgba(239, 68, 68, 0.4)",
                                  "0px 0px 0px rgba(239, 68, 68, 0)",
                                ],
                              },
                            ]
                          : "visible"
                      }
                      className={`border rounded-xl overflow-hidden transition-all duration-300 ${sizeError ? "border-red-500 border-2 ring-2 ring-red-100" : "border-red-100"}`}
                    >
                      <button
                        onClick={() => {
                          setOpenSection(
                            openSection === "size" ? null : "size",
                          );
                          if (selectedSize) setSizeError(false);
                        }}
                        className={`w-full flex items-center justify-between p-4 transition-colors cursor-pointer ${sizeError ? "bg-red-50" : "bg-red-50/30 hover:bg-red-50"}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-gray-800">Size</span>
                          <motion.span
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full uppercase font-bold"
                          >
                            Required
                          </motion.span>
                        </div>
                        <ChevronDown
                          size={20}
                          className={`text-gray-400 transition-transform ${openSection === "size" ? "rotate-180" : ""}`}
                        />
                      </button>
                      <AnimatePresence>
                        {openSection === "size" && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="p-4 bg-white space-y-2"
                          >
                            {sizesList.map((size) => (
                              <label
                                key={size.id}
                                className="flex items-center justify-between cursor-pointer p-3 hover:bg-gray-50 rounded-xl transition-all group"
                              >
                                <div className="flex items-center gap-3 group-hover:translate-x-1 transition-transform">
                                  <input
                                    type="radio"
                                    name="size"
                                    checked={selectedSize?.id === size.id}
                                    onChange={() => setSelectedSize(size)}
                                    className="w-5 h-5 accent-red-500 cursor-pointer"
                                  />
                                  <span className="text-gray-700 font-medium">
                                    {size.name || size.Label}
                                  </span>
                                </div>
                                <span className="text-sm font-semibold text-gray-900">
                                  Rs.{" "}
                                  {size.price ||
                                    size.Price ||
                                    size.extraPrice ||
                                    0}
                                </span>
                              </label>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                    )}

                    <motion.div
                      variants={itemVariants}
                      className="border border-gray-100 rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() =>
                          setOpenSection(
                            openSection === "extra" ? null : "extra",
                          )
                        }
                        className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <span className="font-bold text-gray-800">Extra</span>
                        <ChevronDown
                          size={20}
                          className={`text-gray-400 transition-transform ${openSection === "extra" ? "rotate-180" : ""}`}
                        />
                      </button>
                      {openSection === "extra" && (
                        <div className="p-4 bg-white space-y-2">
                          {extrasList.map((extra) => (
                            <label
                              key={extra.id}
                              className="flex items-center justify-between cursor-pointer p-3 hover:bg-gray-50 rounded-xl transition-all group"
                            >
                              <div className="flex items-center gap-3 group-hover:translate-x-1 transition-transform">
                                <input
                                  type="checkbox"
                                  checked={addedExtras.includes(extra.id)}
                                  onChange={() => toggleItem(extra.id, "extra")}
                                  className="w-5 h-5 accent-red-500 cursor-pointer"
                                />
                                <span className="text-gray-700 font-medium">
                                  {extra.name}
                                </span>
                              </div>
                              <span className="text-sm font-semibold text-gray-900">
                                +Rs. {extra.price}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </motion.div>

                    <motion.div
                      variants={itemVariants}
                      className="border border-gray-100 rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() =>
                          setOpenSection(
                            openSection === "addon" ? null : "addon",
                          )
                        }
                        className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <span className="font-bold text-gray-800">Addons</span>
                        <ChevronDown
                          size={20}
                          className={`text-gray-400 transition-transform ${openSection === "addon" ? "rotate-180" : ""}`}
                        />
                      </button>
                      {openSection === "addon" && (
                        <div className="p-4 bg-white space-y-2">
                          {addonsList.map((addon) => (
                            <label
                              key={addon.id}
                              className="flex items-center justify-between cursor-pointer p-3 hover:bg-gray-50 rounded-xl transition-all group"
                            >
                              <div className="flex items-center gap-3 group-hover:translate-x-1 transition-transform">
                                <input
                                  type="checkbox"
                                  checked={addedAddons.includes(addon.id)}
                                  onChange={() => toggleItem(addon.id, "addon")}
                                  className="w-5 h-5 accent-red-500 cursor-pointer"
                                />
                                <span className="text-gray-700 font-medium">
                                  {addon.name}
                                </span>
                              </div>
                              <span className="text-sm font-semibold text-gray-900">
                                +Rs. {addon.price}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </motion.div>

                    <motion.div variants={itemVariants} className="mt-4">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Special Instructions
                      </label>
                      <textarea
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        placeholder="Any special request?"
                        className="w-full p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--carts-bg-color)] min-h-[80px] resize-none transition-all focus:shadow-inner"
                      />
                    </motion.div>
                  </div>
                </div>

                <motion.div
                  variants={itemVariants}
                  className="sticky bottom-0 left-0 right-0 p-4 md:p-6 border-t border-gray-100 flex flex-col lg:flex-row items-center gap-3 md:gap-4 bg-white z-20"
                >
                  <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-200">
                    <motion.button
                      title="Remove Quantity"
                      whileTap={{ scale: 0.8 }}
                      onClick={() =>
                        setMainItemQty(Math.max(1, mainItemQty - 1))
                      }
                      className="p-3 bg-[var(--carts-bg-color)] hover:bg-[var(--carts-bg-color)]/85 rounded-lg transition-colors cursor-pointer shadow-sm"
                    >
                      <Minus size={18} className="text-gray-900" />
                    </motion.button>
                    <span className="w-12 text-center font-black text-xl text-gray-900">
                      {mainItemQty}
                    </span>
                    <motion.button
                      title="Add Quantity"
                      whileTap={{ scale: 0.8 }}
                      onClick={() => setMainItemQty(mainItemQty + 1)}
                      className="p-3 bg-[var(--carts-bg-color)] hover:bg-[var(--carts-bg-color)]/85 rounded-lg transition-colors cursor-pointer shadow-sm"
                    >
                      <Plus size={18} className="text-gray-900" />
                    </motion.button>
                  </div>

                  <motion.button
                    title="Add to Cart"
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0px 20px 40px rgba(0,0,0,0.15)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onCheckoutClick}
                    style={{ backgroundColor: "var(--carts-bg-color)" }}
                    className="relative w-full md:flex-grow text-gray-900 font-black py-4 px-6 rounded-2xl flex items-center justify-between transition-all cursor-pointer shadow-xl overflow-hidden group"
                  >
                    <motion.div
                      initial={{ x: "-100%" }}
                      animate={{ x: "200%" }}
                      transition={{
                        repeat: Infinity,
                        duration: 2.5,
                        ease: "linear",
                      }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-30deg]"
                    />

                    <span className="relative z-10 text-base">
                      Rs. {calculateTotal().toLocaleString()}
                    </span>
                    <span className="relative z-10 uppercase tracking-widest text-sm flex items-center gap-2">
                      Add To Cart
                    </span>
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductModal;
