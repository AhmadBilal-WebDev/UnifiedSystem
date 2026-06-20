import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { Search, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { section_bg_img } from "../../Contants/Config";
import { exploreTheMenu } from "../../Contants/Config";
const API_URL = import.meta.env.VITE_API_URL;

import "swiper/css";

const ExploreTheMenu = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [swiperInstance, setSwiperInstance] = useState(null);

  const fullText = "Search your cravings...";

  const fetchMenuCategories = async () => {
    try {
      setLoading(true);
      const savedLocation =
        sessionStorage.getItem("userLocation") ||
        localStorage.getItem("userLocation");
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
        const menuData = response.data.menu.map((c) => ({
          id: c.id || c._id,
          name: c.name,
          desc: c.desc || "",
          bannerImg: c.bannerImg || "https://via.placeholder.com/150",
        }));

        setCategories(menuData);

        if (menuData.length > 0 && !activeId) {
          setActiveId(menuData[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching categories in ExploreTheMenu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuCategories();

    window.addEventListener("locationUpdated", fetchMenuCategories);
    return () => {
      window.removeEventListener("locationUpdated", fetchMenuCategories);
    };
  }, []);

  // Filtered list for UI display based on search
  const filteredCategories = categories.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const letterVariants = {
    initial: { opacity: 0, x: -10 },
    animate: (i) => ({
      opacity: [0, 1, 1, 0],
      x: 0,
      transition: {
        duration: 3,
        repeat: Infinity,
        delay: i * 0.1,
        times: [0, 0.1, 0.8, 1],
      },
    }),
  };

  const handleCategoryClick = (category) => {
    setActiveId(category.id);

    if (swiperInstance) {
      // Find index from the absolute data array to prevent slider mismatches during search
      const absoluteIndex = categories.findIndex((c) => c.id === category.id);
      if (absoluteIndex !== -1) {
        swiperInstance.slideTo(absoluteIndex, 600);
      }
    }

    // Dynamic target selection synchronized with CategoryStickyHeader
    const section = document.getElementById(`section-${category.id}`);
    if (section) {
      const yOffset = -140; // Adjusted for sticky header spacing alignment
      const y =
        section.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <section className="relative mt-1 px-4 md:px-8 overflow-hidden max-h-screen">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url(${section_bg_img})`,
          backgroundSize: "400px",
          backgroundRepeat: "repeat",
        }}
      ></div>

      <div className="max-w-6xl mx-auto relative z-10 flex flex-col">
        <div className="flex flex-col items-center mt-8 md:mt-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 bg-[var(--explore-bg-color)]/15 px-4 py-1 rounded-full mb-3"
          >
            <Zap
              size={14}
              className="text-[var(--primary-bg)] fill-[var(--explore-tag-color)]"
            />
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[var(--explore-tag-color)] font-serif">
              {exploreTheMenu.tagText}
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-2xl md:text-3xl font-semibold font-serif text-center text-[var(--accent-black)] tracking-wider uppercase"
          >
            {exploreTheMenu.titleName}
          </motion.h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex-1 w-full mt-5 md:mt-10 flex justify-center"
        >
          <div className="relative group cursor-text w-full">
            <input
              type="text"
              value={searchTerm}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-14 pl-14 pr-6 rounded-2xl border border-gray-200 bg-white shadow-md focus:border-[var(--secondary-bg)] focus:ring-4 focus:ring-[var(--secondary-bg)]/5 focus:outline-none transition-all text-sm font-medium"
            />

            {!searchTerm && !isFocused && (
              <div className="absolute left-14 top-0 bottom-0 flex items-center pointer-events-none">
                {fullText.split("").map((char, index) => (
                  <motion.span
                    key={index}
                    custom={index}
                    variants={letterVariants}
                    initial="initial"
                    animate="animate"
                    className="text-gray-400 text-sm font-medium"
                  >
                    {char === " " ? "\u00A0" : char}
                  </motion.span>
                ))}
              </div>
            )}
            <Search
              className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
          </div>
        </motion.div>

        <div className="relative group/slider mt-5 md:mt-8">
          <AnimatePresence mode="wait">
            {loading ? (
              <div className="text-center py-16 text-sm font-semibold opacity-60 font-serif">
                Loading menu tracks...
              </div>
            ) : filteredCategories.length > 0 ? (
              <Swiper
                onSwiper={setSwiperInstance}
                modules={[Autoplay]}
                spaceBetween={20}
                slidesPerView={2}
                grabCursor={true}
                allowTouchMove={true}
                touchEventsTarget="container"
                autoplay={{ delay: 3000, disableOnInteraction: false }}
                breakpoints={{
                  640: { slidesPerView: 3 },
                  1024: { slidesPerView: 5 },
                }}
                className="!pb-14 !pt-5"
              >
                {filteredCategories.map((item, index) => (
                  <SwiperSlide key={item.id} className="!overflow-visible">
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleCategoryClick(item)}
                      className="cursor-grab active:cursor-grabbing"
                    >
                      <div
                        className={`
                        relative aspect-[4/5] rounded-3xl flex flex-col items-center justify-center p-4 transition-all duration-500 shadow-xl group/card
                        ${
                          activeId === item.id
                            ? "bg-[var(--secondary-bg)] z-20"
                            : "bg-[var(--primary-bg)] hover:bg-[var(--secondary-bg)]"
                        }
                      `}
                      >
                        <div className="w-full h-25 relative z-10 pointer-events-none">
                          <motion.img
                            whileHover={{ rotate: 15, scale: 1.2 }}
                            src={item.bannerImg}
                            alt={item.name}
                            className="w-full h-full object-contain drop-shadow-2xl"
                          />
                        </div>

                        <div className="mt-4 text-center z-10 pointer-events-none">
                          <p
                            className={`text-[14px] font-semibold font-serif uppercase ${activeId === item.id ? "text-[var(--accent-black)]" : "text-white"}`}
                          >
                            {item.name}
                          </p>
                          <p
                            className={`text-[10px] font-serif uppercase mt-1 opacity-80 ${activeId === item.id ? "text-black" : "text-white"}`}
                          >
                            {item.desc}
                          </p>
                          <div
                            className={`h-1 w-6 mx-auto mt-2 rounded-full ${activeId === item.id ? "bg-[var(--accent-black)]" : "bg-white"}`}
                          />
                        </div>
                      </div>
                    </motion.div>
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <div className="text-center py-16 bg-gray-300/40 rounded-3xl border-2 border-dashed border-gray-200">
                <p className="text-gray-400 font-bold italic uppercase tracking-widest">
                  No Flavors Found
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default ExploreTheMenu;
