import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { getApiBase } from "../../lib/apiBase.js";

const API_URL = getApiBase();

const CategoryStickyHeader = ({ isVisible }) => {
  const [categories, setCategories] = useState([]);
  const [activeSection, setActiveSection] = useState("");
  const scrollContainerRef = useRef(null);
  const location = useLocation();

  const isLandingPage = location.pathname === "/";

  // API se Dynamic Categories Lane ka Function
  const fetchHeaderCategories = async () => {
    try {
      const savedLocation =
        sessionStorage.getItem("userLocation") ||
        localStorage.getItem("userLocation");
      let currentCity = "Pattoki"; // Fallback City
      let currentBranchId = "";
      let currentArea = "";
      let parsed = null;

      if (savedLocation) {
        parsed = JSON.parse(savedLocation);
        if (parsed.city && parsed.city !== "Select City") {
          currentCity = parsed.city;
        }
        if (parsed.branchId) {
          currentBranchId = parsed.branchId;
        }
        if (parsed.town && parsed.town !== "Select Town") {
          currentArea = parsed.town;
        }
      }

      const currentFrontendUrl = window.location.origin;

      const params = {
        frontendUrl: currentFrontendUrl,
        city: currentCity,
      };

      if (currentBranchId) {
        params.branchId = currentBranchId;
      } else if (currentArea) {
        params.area = currentArea;
      }

      const response = await axios.get(`${API_URL}/user/menu`, {
        params,
      });

      if (response.data && response.data.success && response.data.menu) {
        const formattedData = response.data.menu.map((c) => ({
          id: c.id || c._id,
          name: c.name,
        }));

        setCategories(formattedData);

        // By default pehli category ko active set kar dete hain
        if (formattedData.length > 0 && !activeSection) {
          setActiveSection(formattedData[0].id);
        }
      }
    } catch (error) {
      console.error(
        "Error fetching categories in CategoryStickyHeader:",
        error,
      );
    }
  };

  // Lifecycle for initial fetch and location change events
  useEffect(() => {
    if (!isLandingPage) return;

    fetchHeaderCategories();

    window.addEventListener("locationUpdated", fetchHeaderCategories);
    return () => {
      window.removeEventListener("locationUpdated", fetchHeaderCategories);
    };
  }, [isLandingPage]);

  // Dynamic Scroll Tracking Handler (Ab IDs name ke bajaye IDs par check hongi)
  useEffect(() => {
    if (!isLandingPage || categories.length === 0) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 180;

      categories.forEach((item) => {
        const element = document.getElementById(`section-${item.id}`);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;

          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(item.id);
          }
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isLandingPage, categories]);

  // Horizontal scroll synchronization for active buttons
  useEffect(() => {
    if (activeSection && scrollContainerRef.current) {
      const activeBtn = scrollContainerRef.current.querySelector(
        `[data-id="${activeSection}"]`,
      );
      if (activeBtn) {
        activeBtn.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
      }
    }
  }, [activeSection]);

  // Click handler to scroll to dynamic FoodSection
  const scrollToSection = (id) => {
    const element = document.getElementById(`section-${id}`);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 140, // Header spacing adjustment
        behavior: "smooth",
      });
      setActiveSection(id);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && isLandingPage && categories.length > 0 && (
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          exit={{ y: -100 }}
          className="fixed top-0 left-0 w-full z-[110] bg-[var(--primary-bg)] shadow-2xl py-5 px-4 flex items-center border-b border-white/10"
        >
          <div
            ref={scrollContainerRef}
            className="flex items-center gap-3 overflow-x-auto w-full no-scrollbar max-w-screen-2xl mx-auto"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <style>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>

            {categories.map((item) => (
              <button
                title={`Select ${item.name}`}
                key={item.id}
                data-id={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`relative text-[10px] md:text-[12px] font-black tracking-tighter px-6 py-3 rounded-full transition-all duration-300 uppercase border-2 flex-shrink-0 cursor-pointer
                  ${
                    activeSection === item.id
                      ? "border-white text-black bg-white scale-105"
                      : "border-white/10 text-white hover:border-white/80 hover:scale-105 active:scale-95"
                  }`}
              >
                {item.name}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CategoryStickyHeader;
