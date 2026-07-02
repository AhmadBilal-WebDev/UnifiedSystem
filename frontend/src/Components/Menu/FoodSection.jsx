import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  X,
  Check,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  LogIn,
} from "lucide-react";
import axios from "axios";

import { cart_btn, section_bg_img, DELIVERY_FEE } from "../../Contants/Config";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

// MODALS
import ProductModal from "../../Components/Menu/Model/ProductModal";
import CartSidebar from "../../Components/Menu/Model/CartSidebar";
import OrderPopup from "../../Components/Menu/Model/ProductModal";
const API_URL = import.meta.env.VITE_API_URL;

const FoodSection = ({ catId, addToCart }) => {
  const [categoriesList, setCategoriesList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [mainItemQty, setMainItemQty] = useState(1);
  const [addedExtras, setAddedExtras] = useState([]);
  const [addedAddons, setAddedAddons] = useState([]);
  const [openSection, setOpenSection] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [instructions, setInstructions] = useState("");

  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("cartItems");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [cartStats, setCartStats] = useState(() => {
    const savedStats = localStorage.getItem("cartStats");
    return savedStats ? JSON.parse(savedStats) : { count: 0, total: 0 };
  });

  const [showFloatingBar, setShowFloatingBar] = useState(false);
  const [showCartSidebar, setShowCartSidebar] = useState(false);
  const [showOrderPopup, setShowOrderPopup] = useState(false);
  const navigate = useNavigate();

  const fetchCategoryMenu = async () => {
    try {
      setLoading(true);

      const savedLocation =
        localStorage.getItem("userLocation") ||
        sessionStorage.getItem("userLocation");
      let currentCity = "Pattoki";

      if (savedLocation) {
        const parsed = JSON.parse(savedLocation);
        if (parsed.city && parsed.city !== "Select City") {
          currentCity = parsed.city;
        }
      }

      const currentFrontendUrl = window.location.origin;

      const params = {
        frontendUrl: currentFrontendUrl,
        city: currentCity,
      };
      if (savedLocation) {
        const parsed = JSON.parse(savedLocation);
        if (parsed.branchId) {
          params.branchId = parsed.branchId;
        } else if (parsed.town && parsed.town !== "Select Town") {
          params.area = parsed.town;
        }
      }

      const response = await axios.get(`${API_URL}/user/menu`, {
        params,
      });

      if (response.data && response.data.success && response.data.menu) {
        const formattedCategories = response.data.menu.map((dbCategory) => ({
          id: dbCategory.id || dbCategory._id,
          name: dbCategory.name,
          icon: dbCategory.icon || "",
          desc: dbCategory.desc || "",
          bannerImg: dbCategory.bannerImg || "",

          items: (dbCategory.items || []).map((item) => ({
            id: item.id || item._id,
            name: item.name,
            price: String(item.price || item.Price || 0),
            desc: item.desc || "",
            img: item.img || "",
            sizes: (item.sizes || []).map((s) => ({
              id: s._id || s.id,
              name: s.name,
              price: s.price || s.Price || s.extraPrice,
            })),
            addons: (item.addons || []).map((a) => ({
              id: a._id || a.id,
              name: a.name,
              price: a.price || a.Price,
            })),
            extras: (item.extras || []).map((e) => ({
              id: e._id || e.id,
              name: e.name,
              price: e.price || e.Price,
            })),
            tags: item.tags || [],
          })),
        }));

        if (catId && catId !== "all" && catId !== 1 && catId !== "1") {
          const filtered = formattedCategories.filter(
            (c) =>
              String(c.id).trim().toLowerCase() ===
              String(catId).trim().toLowerCase(),
          );
          setCategoriesList(
            filtered.length > 0 ? filtered : formattedCategories,
          );
        } else {
          setCategoriesList(formattedCategories);
        }
      }
    } catch (error) {
      console.error("Error fetching data from API inside FoodSection:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryMenu();

    window.addEventListener("locationUpdated", fetchCategoryMenu);
    return () => {
      window.removeEventListener("locationUpdated", fetchCategoryMenu);
    };
  }, [catId]);

  useEffect(() => {
    if (cartItems && cartItems.length > 0) {
      const total = cartItems.reduce(
        (acc, item) => acc + Number(item.totalPrice || 0),
        0,
      );
      setCartStats({
        count: cartItems.length,
        total: total,
      });
      setShowFloatingBar(true);
    } else {
      setCartStats({ count: 0, total: 0 });
      setShowFloatingBar(false);
    }
  }, [cartItems]);

  useEffect(() => {
    const syncEverything = () => {
      const savedCart = JSON.parse(localStorage.getItem("cartItems") || "[]");
      setCartItems(savedCart);

      const total = savedCart.reduce(
        (acc, item) => acc + Number(item.totalPrice || 0),
        0,
      );
      setCartStats({
        count: savedCart.length,
        total: total,
      });

      if (savedCart.length > 0) {
        setShowFloatingBar(true);
      } else {
        setShowFloatingBar(false);
      }
    };

    syncEverything();

    window.addEventListener("cartUpdated", syncEverything);
    window.addEventListener("storage", syncEverything);

    return () => {
      window.removeEventListener("cartUpdated", syncEverything);
      window.removeEventListener("storage", syncEverything);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48 text-sm font-semibold font-serif opacity-60">
        Loading fresh menu items...
      </div>
    );
  }

  if (categoriesList.length === 0) {
    return (
      <div className="flex justify-center items-center h-32 text-xs font-serif text-gray-400">
        No products available for this specific category selector.
      </div>
    );
  }

  const sizesList = selectedItem?.sizes || [];
  const addonsList = selectedItem?.addons || [];
  const extrasList = selectedItem?.extras || [];

  const handleAddToCart = (item) => {
    setSelectedItem(item);
    setMainItemQty(1);
    setAddedExtras([]);
    setAddedAddons([]);

    const itemSizes = item?.sizes || [];
    if (itemSizes.length > 0) {
      const cheapest = [...itemSizes].sort((a, b) => {
        const pa =
          parseFloat(String(a.price ?? a.Price ?? 0).replace(/[^\d.]/g, "")) ||
          0;
        const pb =
          parseFloat(String(b.price ?? b.Price ?? 0).replace(/[^\d.]/g, "")) ||
          0;
        return pa - pb;
      })[0];
      setSelectedSize(cheapest);
    } else {
      setSelectedSize(null);
    }
    setOpenSection(null);
    setInstructions("");
    setShowModal(true);
  };

  const calculateTotal = () => {
    if (!selectedItem) return 0;

    const safeNum = (val) => {
      if (!val) return 0;
      const cleaned = String(val).replace(/[^\d.]/g, "");
      return parseFloat(cleaned) || 0;
    };

    const base = safeNum(selectedItem.price || selectedItem.Price);

    const hasSizes = sizesList.length > 0;
    const sizePrice = selectedSize
      ? safeNum(
          selectedSize.price || selectedSize.Price || selectedSize.extraPrice,
        )
      : 0;
    const itemPrice = hasSizes ? sizePrice : base;

    const extrasTotal = addedExtras.reduce((sum, id) => {
      const item = extrasList.find((e) => e.id === id);
      return sum + safeNum(item?.price || item?.Price);
    }, 0);

    const addonsTotal = addedAddons.reduce((sum, id) => {
      const item = addonsList.find((a) => a.id === id);
      return sum + safeNum(item?.price || item?.Price);
    }, 0);

    const qty = Number(mainItemQty) || 1;
    const total = itemPrice * qty + extrasTotal + addonsTotal;
    return total;
  };

  const handleFinalCheckout = () => {
    if (!selectedItem) return;

    const finalPrice = calculateTotal();
    const qty = Number(mainItemQty) || 1;

    const newItem = {
      ...selectedItem,
      uniqueCartId: Date.now(),
      quantity: qty,
      totalPrice: finalPrice,
      unitPrice: finalPrice / qty,
      extras: addedExtras
        .map((id) => extrasList.find((e) => e.id === id))
        .filter(Boolean),
      addons: addedAddons
        .map((id) => addonsList.find((a) => a.id === id))
        .filter(Boolean),
      selectedSize: selectedSize,
      instructions: instructions,
    };

    const existingCart = JSON.parse(localStorage.getItem("cartItems") || "[]");
    const updatedCart = [...existingCart, newItem];

    localStorage.setItem("cartItems", JSON.stringify(updatedCart));
    setCartItems(updatedCart);

    window.dispatchEvent(new Event("cartUpdated"));
    setShowModal(false);
  };

  const handlePlaceOrder = () => {
    setShowCartSidebar(false);
    navigate("/confirm-order");
  };

  const toggleItem = (id, type) => {
    if (type === "extra") {
      setAddedExtras((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
      );
    } else {
      setAddedAddons((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
      );
    }
  };

  return (
    <div className="w-full bg-white flex flex-col gap-16 py-6">
      {showFloatingBar && (
        <motion.div
          initial={{ y: 100, x: "-50%", opacity: 0 }}
          animate={{ y: 0, x: "-50%", opacity: 1 }}
          exit={{ y: 100, x: "-50%", opacity: 0 }}
          whileHover={{ scale: 1.05, y: -5 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="fixed bottom-6 left-1/2 z-[9999] w-[95%] md:w-auto min-w-[350px] md:min-w-[400px] cursor-pointer"
        >
          <div
            style={{ backgroundColor: "var(--carts-bg-sticy-color)" }}
            className="text-black px-4 py-3 md:py-2.5 rounded-[1rem] shadow-md hover:shadow-2xl flex items-center justify-between gap-4 border-none outline-none relative overflow-hidden transition-shadow duration-300"
          >
            <div className="flex items-center gap-4 ml-2">
              <div className="relative">
                <ShoppingBag size={20} strokeWidth={2} />
                <AnimatePresence mode="popLayout">
                  {cartStats.count > 0 && (
                    <motion.span
                      key={cartStats.count}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute -top-2 -right-2 bg-black text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-[var(--carts-bg-sticy-color)]"
                    >
                      {cartStats.count}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <AnimatePresence mode="wait">
                <motion.h3
                  key={cartStats.total}
                  initial={{ y: 5, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -5, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="font-black text-sm md:text-[15px] tracking-tight"
                >
                  Rs. {cartStats.total.toLocaleString()}
                </motion.h3>
              </AnimatePresence>
            </div>
            <motion.button
              title="View Carts"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowCartSidebar(true)}
              className="relative bg-black/10 hover:bg-black/20 text-black px-4 py-2 rounded-xl flex items-center gap-2 font-black text-[13px] transition-all cursor-pointer overflow-hidden"
            >
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "linear",
                  repeatDelay: 1,
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
              />
              <span className="relative z-10 flex items-center gap-2">
                View Cart
                <ArrowRight size={17} strokeWidth={3} />
              </span>
            </motion.button>
          </div>
        </motion.div>
      )}

      {categoriesList.map((categoryData) => (
        <section
          key={categoryData.id}
          id={`section-${categoryData.id}`}
          className="w-full mt-2 relative overflow-hidden bg-white scroll-mt-24"
        >
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div
              className={`flex flex-col items-center gap-5 p-8 w-full rounded-[1rem] shadow-xl bg-[var(--container-bg-color)] sm:flex-row sm:justify-between sm:px-10 sm:py-8 md:py-10 md:px-12 lg:px-20 md:rounded-[2rem]`}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center sm:items-start relative sm:text-start"
              >
                {categoryData.icon && (
                  <span className="flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-semibold font-serif uppercase bg-[var(--container-tag-bg-color)] text-black">
                    {categoryData.icon.startsWith("http") ? (
                      <img
                        src={categoryData.icon}
                        alt="icon"
                        className="w-4 h-4"
                      />
                    ) : (
                      <span>{categoryData.icon}</span>
                    )}
                  </span>
                )}
                <h1
                  className={`mt-3 text-[var(--container-title-bg-color)] font-semibold text-[30px] text-center uppercase tracking-[0.1rem] font-serif sm:text-[35px] md:text-[45px]`}
                >
                  {categoryData.name}
                </h1>
                {categoryData.items && categoryData.items.length > 0 && (
                  <motion.button
                    title="Select Order"
                    onClick={() => handleAddToCart(categoryData.items[0])}
                    whileTap={{ scale: 0.95 }}
                    className={`mt-3 px-10 py-2 sm:px-15 sm:py-3 md:px-20 md:py-3 md:text-[12px] rounded-full text-[10px] font-semibold uppercase font-serif transition-all bg-[var(--container-btn-bg-color)] text-[var(--container-btn-color)] hover:bg-[#D44A1C] hover:text-white shadow-lg cursor-pointer`}
                  >
                    View All
                  </motion.button>
                )}
              </motion.div>
              {categoryData.bannerImg && (
                <motion.img
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  src={categoryData.bannerImg}
                  alt={categoryData.name}
                  className="w-[18rem] mt-5 rounded-2xl sm:mt-0 sm:w-[20rem] md:w-[22rem]"
                />
              )}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6 mt-5">
              {categoryData.items?.map((item) => (
                <div
                  key={item.id}
                  className="bg-[var(--carts-bg-color)] w-full p-3 sm:p-5 rounded-lg sm:rounded-2xl flex flex-col transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group border border-transparent hover:border-white/10"
                >
                  <div className="relative rounded-lg md:rounded-[1.5rem] overflow-hidden aspect-square">
                    <img
                      src={item.img}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                    />
                    {/* Debugging Tag Area */}
                    {/* Debugging Tag Area - Sahi wala code */}
                    <div className="absolute top-[8px] left-[8px] z-10 flex flex-wrap gap-1">
                      {Array.isArray(item.tags) && item.tags.length > 0
                        ? item.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="text-[78x] md:text-[11px] font-semibold font-serif px-2 py-0.5 rounded-full bg-red-500 text-white shadow-sm"
                            >
                              {tag}
                            </span>
                          ))
                        : null}
                    </div>
                  </div>
                  <div className="flex flex-col flex-grow">
                    <h3
                      className={`text-[var(--carts-title-color)] font-semibold text-[13px] mt-2 uppercase font-serif leading-tight line-clamp-1 sm:text-[18px] sm:mt-5 transition-colors duration-300 group-hover:text-opacity-80`}
                    >
                      {item.name}
                    </h3>
                    <p className="text-[12px] font-serif text-[var(--carts-description-color)] mt-2 sm:text-[15px] line-clamp-2 opacity-70">
                      {item.desc}
                    </p>
                    <div className="mt-auto">
                      <div className="border-t border-white/5 pt-2">
                        <span
                          className={`text-[10px] md:text-[12px] uppercase font-semibold font-serif tracking-[0.1rem] text-[var(--carts-price-color)] opacity-60`}
                        >
                          Price
                        </span>
                        <div className="flex justify-between items-center w-full mt-1">
                          <span className="text-[14px] md:text-[16px] uppercase font-black font-serif text-[var(--carts-price-color)]">
                            Rs.
                          </span>
                          <p className="font-extrabold text-[20px] md:text-[22px] font-serif text-[var(--carts-price-color)] tracking-tighter">
                            {(() => {
                              const itemSizes = item.sizes || [];
                              if (itemSizes.length > 0) {
                                const cheapest = Math.min(
                                  ...itemSizes.map(
                                    (s) =>
                                      parseFloat(
                                        String(s.price ?? s.Price ?? 0).replace(
                                          /[^\d.]/g,
                                          "",
                                        ),
                                      ) || 0,
                                  ),
                                );
                                return (
                                  <>
                                    <span className="block text-[9px] md:text-[10px] uppercase font-bold font-serif tracking-[0.08rem] text-[var(--carts-price-color)] opacity-60">
                                      Starting from
                                    </span>
                                    {cheapest}
                                  </>
                                );
                              }
                              return item.price;
                            })()}
                          </p>
                        </div>
                      </div>
                      <button
                        title="Add Your Card"
                        className={`w-full flex items-center justify-center gap-2 mt-4 py-3 md:py-4 rounded-xl transition-all duration-300 active:scale-95 hover:brightness-110 hover:shadow-lg relative overflow-hidden group/btn cursor-pointer ${
                          cartItems.some((cartItem) => cartItem.id === item.id)
                            ? "bg-[var(--carts-btns-hover-bg-color)]"
                            : "bg-[var(--carts-btns-bg-color)] hover:bg-[var(--carts-btns-hover-bg-color)]"
                        }`}
                        onClick={() => handleAddToCart(item)}
                      >
                        {cartItems.some(
                          (cartItem) => cartItem.id === item.id,
                        ) ? (
                          <>
                            <Check size={16} className="text-black" />
                            <span className="font-semibold uppercase font-serif text-[10px] md:text-xs tracking-wider text-black">
                              Selected
                            </span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag
                              size={16}
                              className="transition-transform group-hover/btn:-rotate-12"
                            />
                            <span
                              className="font-semibold uppercase font-serif text-[10px] md:text-xs tracking-wider"
                              style={{ color: "var(--carts-tag-color)" }}
                            >
                              {cart_btn?.text || "Add to Cart"}
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      <ProductModal
        showModal={showModal}
        setShowModal={setShowModal}
        selectedItem={selectedItem}
        mainItemQty={mainItemQty}
        setMainItemQty={setMainItemQty}
        addedExtras={addedExtras}
        setAddedExtras={setAddedExtras}
        addedAddons={addedAddons}
        setAddedAddons={setAddedAddons}
        openSection={openSection}
        setOpenSection={setOpenSection}
        selectedSize={selectedSize}
        setSelectedSize={setSelectedSize}
        extrasList={extrasList}
        addonsList={addonsList}
        sizesList={sizesList}
        handleFinalCheckout={handleFinalCheckout}
        toggleItem={toggleItem}
        calculateTotal={calculateTotal}
        instructions={instructions}
        setInstructions={setInstructions}
      />
      <CartSidebar
        showCartSidebar={showCartSidebar}
        setShowCartSidebar={setShowCartSidebar}
        cartItems={cartItems}
        setCartItems={setCartItems}
        cartStats={cartStats}
        setCartStats={setCartStats}
        handlePlaceOrder={handlePlaceOrder}
      />
      <OrderPopup
        showOrderPopup={showOrderPopup}
        setShowOrderPopup={setShowOrderPopup}
      />
    </div>
  );
};

export default FoodSection;
