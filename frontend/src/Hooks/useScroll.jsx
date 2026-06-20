import { useState, useEffect } from "react";

export const useScroll = (threshold = 500) => {
  const [isStickyVisible, setIsStickyVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsStickyVisible(window.scrollY > threshold);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  return isStickyVisible;
};
