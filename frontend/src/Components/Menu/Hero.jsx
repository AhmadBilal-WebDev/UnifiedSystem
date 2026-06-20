import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { slides } from "../../Contants/Config";

const CodeHeroBanner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const slideNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const slidePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };
  const scrollToMenu = () => {
    const firstCategory = slides[currentIndex].tag;
    const element = document.getElementById(firstCategory);

    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: "smooth",
      });
    } else {
      window.scrollTo({
        top: window.innerHeight * 0.8,
        behavior: "smooth",
      });
    }
  };
  useEffect(() => {
    const interval = setInterval(slideNext, 5000);
    return () => clearInterval(interval);
  }, [slideNext]);

  return (
    <section className="relative w-full h-[35vh] md:h-[45vh] lg:h-[420px] overflow-hidden bg-[#050505] shadow-xl">
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={currentIndex}
          custom={direction}
          initial={{ opacity: 0, filter: "blur(10px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: "blur(10px)" }}
          transition={{ duration: 0.7, ease: [0.32, 0, 0.67, 0] }}
          className="absolute inset-0 w-full h-full"
        >
          <motion.img
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 6, ease: "easeOut" }}
            src={slides[currentIndex].url}
            className="w-full h-full object-cover select-none pointer-events-none opacity-80"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />

          <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-16 lg:px-32">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 mb-2"
            >
              <div className="h-[2px] w-8 bg-[var(--banner-line-color)]" />
              <span className="text-[var(--banner-tag-color)] font-bold uppercase tracking-[0.1em] text-[10px] font-serif sm:text-[12px] md:text-[16px]">
                {slides[currentIndex].tag}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-[var(--banner-title-color)] text-sm uppercase font-semibold tracking-[0.2em] font-serif mb-8 text-[15px] sm:text-[18px] md:text-[22px]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {slides[currentIndex].title}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <button
                title="Quick Order"
                onClick={scrollToMenu}
                className="flex items-center gap-2 bg-[var(--banner-btn-bg-color)] text-[var(--banner-btn-color)] font-serif rounded-full h-[40px] px-[40px] font-semibold hover:bg-[var(--banner-btn-hover-bg-color)] hover:text-[var(--banner-btn-hover-color)] hover:cursor-pointer transition-all duration-300 active:scale-95"
              >
                Order Now
              </button>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-8 right-6 md:right-16 flex items-center gap-8 z-40">
        <div className="flex gap-4 hidden md:flex">
          <button
            onClick={slidePrev}
            className="text-white/40 hover:text-white transition-colors"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={slideNext}
            className="text-white/40 hover:text-white transition-colors"
          >
            <ChevronRight size={22} />
          </button>
        </div>

        <div className="flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              className={`h-1 rounded-full transition-all duration-500 overflow-hidden ${
                currentIndex === index
                  ? "w-16 bg-white/20"
                  : "w-5 bg-white/10 hover:bg-white/30"
              }`}
            >
              {currentIndex === index && (
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "0%" }}
                  transition={{ duration: 5, ease: "linear" }}
                  className="h-full w-full bg-[#D44A1C]"
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CodeHeroBanner;
