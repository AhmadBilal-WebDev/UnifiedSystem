import React, { useState, useEffect, useRef, useCallback } from "react";
import { FaFacebookF, FaInstagram, FaXTwitter } from "react-icons/fa6";
import {
  title_name,
  logImg,
  fetchLocationData,
  getSelectedBranchFromStorage,
  formatBranchHours,
} from "../../Contants/Config";
import { Link, useLocation } from "react-router-dom";

const Footer = () => {
  const [isAtFooter, setIsAtFooter] = useState(false);
  const [branches, setBranches] = useState([]);
  const [serviceHours, setServiceHours] = useState({ days: "Monday - Sunday", time: "" });
  const [loaded, setLoaded] = useState(false);
  const footerRef = useRef(null);
  const location = useLocation();

  const isLandingPage = location.pathname === "/";

  const loadBranchContacts = useCallback(async () => {
    const rows = await fetchLocationData();
    setBranches(rows);

    const selected = getSelectedBranchFromStorage();
    const hoursBranch = selected || rows[0];
    if (hoursBranch) {
      setServiceHours({
        days: "Monday - Sunday",
        time: formatBranchHours(hoursBranch.openTime, hoursBranch.closeTime) || "—",
      });
    } else {
      setServiceHours({ days: "Monday - Sunday", time: "" });
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    loadBranchContacts();
    window.addEventListener("locationUpdated", loadBranchContacts);
    return () => window.removeEventListener("locationUpdated", loadBranchContacts);
  }, [loadBranchContacts]);

  const handleScrollAction = () => {
    if (isAtFooter) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsAtFooter(entry.isIntersecting);
      },
      { threshold: 0.1 },
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => {
      if (footerRef.current) observer.unobserve(footerRef.current);
    };
  }, []);

  const secondaryColor = "text-[var(--secondary-bg)]";

  const formatAddress = (branch) => {
    const parts = [];
    if (branch.address?.trim()) parts.push(branch.address.trim());
    if (branch.city?.trim() && !branch.address?.toLowerCase().includes(branch.city.toLowerCase())) {
      parts.push(branch.city.trim());
    }
    return parts.join(", ") || branch.city || "—";
  };

  return (
    <footer
      ref={footerRef}
      className="w-full bg-[var(--primary-bg)] text-[var(--accent-white)] pt-12 pb-6 px-6 md:px-16 border-t border-white/10 relative"
    >
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-10">
          <div className="md:col-span-2 flex justify-center md:justify-start">
            <div className="w-35 h-35 flex items-center justify-center transform transition-transform duration-500">
              <img
                src={logImg.img}
                alt={logImg.altName}
                className="w-28 h-28 object-contain"
              />
            </div>
          </div>

          <div className="md:col-span-5 space-y-6 text-sm">
            <h3
              className={`font-black text-xl uppercase italic tracking-tighter ${secondaryColor}`}
            >
              Contact Us
            </h3>

            <div className="space-y-4 opacity-90">
              {!loaded && (
                <p className="text-sm opacity-70">Loading branch details…</p>
              )}
              {loaded && branches.length === 0 && (
                <p className="text-sm opacity-70">Branch contact details are not available yet.</p>
              )}
              {branches.map((branch, index) => (
                <div key={branch.id} className={index !== 0 ? "pt-2" : ""}>
                  <p className="font-black bg-[var(--accent-white) uppercase text-sm tracking-widest mb-1 text-[var(--primary-bg)] px-1 inline-block">
                    {branch.name}
                    {branch.city ? ` — ${branch.city}` : ""}
                  </p>
                  <p className="text-sm">{formatAddress(branch)}</p>
                  {branch.phone ? (
                    <p className={secondaryColor}>{branch.phone}</p>
                  ) : null}
                </div>
              ))}
            </div>

            {(serviceHours.time || !loaded) && (
              <div className="pt-2 border-t border-white/5">
                <h4
                  className={`font-black uppercase tracking-widest text-lg mb-2 ${secondaryColor}`}
                >
                  Service Hours
                </h4>
                <div className="flex justify-between max-w-sm opacity-80">
                  <span className="font-bold uppercase text-sm">
                    {serviceHours.days}
                  </span>
                  <span className="font-black text-sm">
                    {loaded ? (serviceHours.time || "—") : "…"}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="md:col-span-5 flex flex-col items-center md:items-start space-y-8">
            <div>
              <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-4">
                Get Our App On!
              </h3>
              <div className="flex gap-3">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                  alt="Google Play"
                  title="Download on Google Play Store"
                  className="h-10 cursor-pointer hover:scale-105 transition-transform"
                />
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                  alt="App Store"
                  title="Download on Apple App Store"
                  className="h-10 cursor-pointer hover:scale-105 transition-transform"
                />
              </div>
            </div>

            <div>
              <h4 className="font-black text-center uppercase tracking-widest text-[11px] mb-3 opacity-90">
                Follow Us:
              </h4>
              <div className="flex gap-4">
                <FaFacebookF
                  size={28}
                  title="Facebook"
                  className="text-blue-500 cursor-pointer hover:scale-110 transition-transform"
                />
                <FaInstagram
                  size={28}
                  title="Instagram"
                  className="text-red-700 cursor-pointer hover:scale-110 transition-transform"
                />
                <FaXTwitter
                  size={28}
                  title="Twitter"
                  className="text-black cursor-pointer hover:scale-110 transition-transform"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center md:justify-center mb-4 gap-x-4 gap-y-3 text-[10px] md:text-[14px] font-black uppercase tracking-widest">
          <Link
            to="/terms"
            title="Terms and Conditions"
            className={`hover:underline underline-offset-4 decoration-2 ${secondaryColor}`}
          >
            Terms and conditions
          </Link>
          <span className="opacity-20">|</span>
          <Link
            to="/privacy"
            title="Privacy Policy"
            className={`hover:underline underline-offset-4 decoration-2 ${secondaryColor}`}
          >
            Privacy Policy
          </Link>
          <span className="opacity-20">|</span>
          <Link
            to="/sitemap"
            title="Sitemap"
            className={`hover:underline underline-offset-4 decoration-2 ${secondaryColor}`}
          >
            Sitemap
          </Link>
        </div>

        <div className="flex flex-col items-center pt-5 border-t border-white/20 ">
          <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.4em] opacity-70 text-center">
            © {new Date().getFullYear()} Powered by{" "}
            <span className={secondaryColor}>
              {title_name.firstName} {title_name.secondName}
            </span>{" "}
            — Taste that Crust
          </p>
        </div>
      </div>

      {isLandingPage && (
        <div
          className={`fixed right-6 z-50 transition-all duration-500 ease-in-out ${
            isAtFooter ? "bottom-27 md:bottom-16" : "bottom-28 md:bottom-10"
          }`}
        >
          <button
            onClick={handleScrollAction}
            title={isAtFooter ? "Scroll Up" : "Scroll Down"}
            style={{ background: "var(--carts-bg-scrol-color)" }}
            className="w-12 h-12 text-black rounded-full flex items-center justify-center shadow-[0_10px_20px_rgba(245,195,50,0.3)] hover:scale-110 active:scale-95 transition-all brightness-110 hover:brightness-125"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform duration-500 ${
                isAtFooter ? "rotate-0" : "rotate-180"
              }`}
            >
              <path d="m18 15-6-6-6 6" />
            </svg>
          </button>
        </div>
      )}
    </footer>
  );
};

export default Footer;
