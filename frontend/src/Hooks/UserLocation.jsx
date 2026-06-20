import { useState, useEffect } from "react";

export const useUserLocation = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderType, setOrderType] = useState("Delivery");

  const [selectedCity, setSelectedCity] = useState("Select City");
  const [selectedTown, setSelectedTown] = useState("Select Town");
  const [selectedBranchId, setSelectedBranchId] = useState("");

  useEffect(() => {
    const loadLocation = () => {
      const saved = localStorage.getItem("userLocation");

      if (!saved) {
        localStorage.removeItem("userLocation");
        setIsModalOpen(true);
      } else {
        try {
          const data = JSON.parse(saved);

          setSelectedCity(data.city || "Select City");
          setSelectedTown(data.town || "Select Town");
          setSelectedBranchId(data.branchId || "");
          setOrderType(data.type || "Delivery");
        } catch (error) {
          console.log("Location Parse Error:", error);
        }
      }
    };

    loadLocation();

    window.addEventListener("locationUpdated", loadLocation);

    return () => {
      window.removeEventListener("locationUpdated", loadLocation);
    };
  }, []);

  const handleConfirmLocation = () => {
    if (selectedTown !== "Select Town" && selectedCity !== "Select City") {
      const locationInfo = {
        city: selectedCity,
        town: selectedTown,
        branchId: selectedBranchId || "",
        type: orderType,
      };

      localStorage.setItem("userLocation", JSON.stringify(locationInfo));

      window.dispatchEvent(new Event("locationUpdated"));

      setIsModalOpen(false);
    }
  };

  return {
    isModalOpen,
    setIsModalOpen,

    orderType,
    setOrderType,

    selectedCity,
    setSelectedCity,

    selectedTown,
    setSelectedTown,

    selectedBranchId,
    setSelectedBranchId,

    handleConfirmLocation,
  };
};
