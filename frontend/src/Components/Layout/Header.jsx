import React, { useState, useEffect } from "react";
import { ShoppingBag, X, User, Menu } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { logImg, title_name } from "../../Contants/Config";
import { IoLocationSharp, IoLogoWhatsapp } from "react-icons/io5";
import { HiOutlineChevronDown } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import { CONTACT_CONFIG } from "../../Contants/Config";
import {
  DesktopProfile,
  MobileProfile,
} from "../../Components/Layout/ProfileUser";
import LoginModal from "../../Components/Authentication/Login";
import RegisterModal from "../../Components/Authentication/Signup";

import LocationModal from "../Layout/LocationModel";

const Header = ({
  cartCount,
  user,
  setUser,
  selectedTown,
  setSelectedTown,
  selectedCity,
  setSelectedCity,
  orderType,
  setOrderType,
}) => {
  const [openMenu, setOpenMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [localCartCount, setLocalCartCount] = useState(0);
  const [showCartSidebar, setShowCartSidebar] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const isLandingPage = location.pathname === "/";

  useEffect(() => {
    const checkUser = () => {
      const savedUser = localStorage.getItem("userInfo");
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        if (JSON.stringify(user) !== JSON.stringify(parsedUser)) {
          setUser(parsedUser);
        }
      } else if (user) {
        setUser(null);
      }
    };

    checkUser();
    window.addEventListener("storage", checkUser);
    window.addEventListener("userLoginStatusChange", checkUser);

    const userInterval = setInterval(checkUser, 500);

    return () => {
      window.removeEventListener("storage", checkUser);
      window.removeEventListener("userLoginStatusChange", checkUser);
      clearInterval(userInterval);
    };
  }, [user, setUser]);

  const syncCartCount = () => {
    const savedStats = localStorage.getItem("cartStats");
    if (savedStats) {
      const { count } = JSON.parse(savedStats);
      setLocalCartCount(count || 0);
    } else {
      const savedItems = localStorage.getItem("cartItems");
      if (savedItems) {
        setLocalCartCount(JSON.parse(savedItems).length || 0);
      } else {
        setLocalCartCount(0);
      }
    }
  };

  const handleCartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (localCartCount > 0) {
      navigate("/confirm-order");
    }
    setOpenMenu(false);
  };

  const openRegister = () => {
    setIsLoginOpen(false);
    setIsRegisterOpen(true);
  };

  const openLogin = () => {
    setIsRegisterOpen(false);
    setIsLoginOpen(true);
  };

  useEffect(() => {
    const openSidebar = () => {
      setShowCartSidebar(true);
    };
    window.addEventListener("openCartSidebar", openSidebar);
    return () => {
      window.removeEventListener("openCartSidebar", openSidebar);
    };
  }, []);

  useEffect(() => {
    syncCartCount();
    const handleScroll = () => setScrolled(window.scrollY > 50);

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("cartUpdated", syncCartCount);
    window.addEventListener("storage", syncCartCount);

    const interval = setInterval(syncCartCount, 1000);

    document.body.style.overflow =
      openMenu || isLocationModalOpen ? "hidden" : "auto";

    window.dispatchEvent(
      new CustomEvent("menuStateChange", { detail: openMenu }),
    );

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("cartUpdated", syncCartCount);
      window.removeEventListener("storage", syncCartCount);
      clearInterval(interval);
    };
  }, [openMenu, isLocationModalOpen]);

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("cartItems");
    localStorage.removeItem("cartStats");
    setUser(null);
    setLocalCartCount(0);
    setOpenMenu(false);
    window.dispatchEvent(new Event("cartUpdated"));
    window.dispatchEvent(new Event("forceCartReset"));
    navigate("/");
  };

  const commonBtnClass =
    "h-[40px] md:h-[47px] rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg active:scale-95 hover:scale-105";

  return (
    <>
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        openRegister={openRegister}
      />

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        openLogin={openLogin}
      />

      <LocationModal
        isModalOpen={isLocationModalOpen}
        handleCloseModal={() => setIsLocationModalOpen(false)}
        orderType={orderType}
        setOrderType={setOrderType}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        selectedTown={selectedTown}
        setSelectedTown={setSelectedTown}
      />

      <header
        className={`w-full bg-[var(--primary-bg)] text-[var(--accent-white)] flex justify-between items-center px-3 md:px-10 sticky top-0 z-[60] transition-all duration-500 ${
          scrolled ? "h-14 md:h-16 shadow-2xl" : "h-20"
        }`}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button
            title="Select your Location"
            onClick={() => setIsLocationModalOpen(true)}
            className={`flex ${commonBtnClass} bg-[var(--secondary-bg)] text-black px-2 md:px-4 gap-2 md:gap-3 cursor-pointer shrink-0 max-w-[120px] md:max-w-none`}
          >
            <div className="flex items-center gap-1">
              <IoLocationSharp size={18} className="text-black shrink-0" />
              <div className="flex flex-col items-start leading-tight min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-[7px] md:text-[9px] font-black uppercase tracking-tight truncate">
                    Delight Delivery
                  </span>
                  <HiOutlineChevronDown size={8} className="text-black" />
                </div>
                <span className="text-[9px] md:text-[10px] font-bold truncate max-w-[60px] md:max-w-[100px]">
                  {selectedTown !== "Select Town" ? selectedTown : "Location"}
                </span>
              </div>
            </div>
          </button>

          <a
            title="Contact WhatsApp"
            href={`https://wa.me/${CONTACT_CONFIG.whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`hidden lg:flex ${commonBtnClass} bg-[var(--secondary-bg)] text-black px-4 gap-2 cursor-pointer shrink-0`}
          >
            <div className="flex items-center gap-2">
              <IoLogoWhatsapp size={20} className="text-black" />
              <span className="text-[14px] font-bold tracking-tighter">
                Contact with Us
              </span>
            </div>
          </a>
        </div>

        <section className="flex flex-1 justify-center items-center relative">
          <div
            title="Delight Crust Home"
            onClick={() => navigate("/")}
            className={`flex flex-col justify-center items-center cursor-pointer group rounded-full absolute border-4 shadow-2xl border-[var(--accent-white)] bg-[var(--primary-bg)] transition-all duration-500 hover:scale-110 active:scale-95 overflow-hidden z-50 ${
              scrolled
                ? "h-[3.5rem] w-[3.5rem] md:h-[4.5rem] md:w-[4.5rem] top-[-10px] md:top-[-19px]"
                : "h-[4.5rem] w-[4.5rem] md:h-[6rem] md:w-[6rem] top-[-10px] md:top-[-17px]"
            }`}
          >
            <img
              src={logImg.img}
              alt={logImg.altName}
              className={`${
                scrolled ? "w-10 md:w-14" : "w-14 md:w-20"
              } transition-all duration-700 group-hover:rotate-[360deg] object-cover`}
            />
          </div>
        </section>

        <section className="flex-1 flex justify-end items-center gap-1 md:gap-2">
          <div className="relative">
            <button
              type="button"
              title={localCartCount > 0 ? "View shopping" : "Cart is Empty"}
              onClick={handleCartClick}
              className={`relative p-2 bg-[var(--secondary-bg)] rounded-xl transition-all ${
                localCartCount > 0
                  ? "cursor-pointer active:scale-90"
                  : "cursor-not-allowed opacity-60 hover:scale-100"
              }`}
            >
              <ShoppingBag size={20} className="text-black md:w-6 md:h-6" />

              {localCartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-[8px] md:text-[10px] w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center font-bold">
                  {localCartCount}
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            {user ? (
              <>
                <div className="hidden lg:block scale-[0.85] md:scale-100">
                  <DesktopProfile user={user} handleLogout={handleLogout} />
                </div>
                <button
                  onClick={() => setOpenMenu(true)}
                  className="flex lg:hidden items-center gap-1.5 p-2 bg-[var(--secondary-bg)] text-black rounded-lg active:scale-90 shrink-0 font-bold text-[11px] uppercase tracking-tight"
                >
                  <Menu size={18} />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsLoginOpen(true)} // Is par click karne se Login Modal khulega
                  className="flex lg:hidden p-2 bg-[var(--secondary-bg)] text-black rounded-2xl active:scale-90 shrink-0"
                >
                  <User size={20} />
                </button>

                <button
                  title="Register or Login"
                  type="button"
                  onClick={() => setIsLoginOpen(true)}
                  className={`hidden lg:flex ${commonBtnClass} bg-[var(--secondary-bg)] text-black px-6 font-bold text-[14px] whitespace-nowrap cursor-pointer`}
                >
                  Sign In / Register
                </button>
              </>
            )}
          </div>
        </section>
      </header>

      <AnimatePresence>
        {openMenu && (
          <div className="fixed inset-0 z-[999] flex justify-end lg:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setOpenMenu(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="relative w-full max-w-[300px] h-full shadow-2xl z-10"
            >
              <MobileProfile
                user={user}
                handleLogout={handleLogout}
                setOpenMenu={setOpenMenu}
                setShowAuthModal={setIsLoginOpen}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {isLandingPage && (
        <a
          href={`https://wa.me/${CONTACT_CONFIG.whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed right-5.5 bottom-45 z-[55] lg:hidden bg-[#25D366] text-white p-3.5 rounded-full shadow-[0_10px_25px_rgba(37,211,102,0.4)] hover:scale-110 transition-all duration-300 flex items-center justify-center active:scale-90 border-2 border-white/20"
          title="WhatsApp Us"
        >
          <IoLogoWhatsapp size={21} />
        </a>
      )}
    </>
  );
};

export default Header;
