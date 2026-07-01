import React, { useState, useEffect } from "react";
import { IoCloseOutline } from "react-icons/io5";
import {
  HiOutlineChevronDown,
  HiOutlineOfficeBuilding,
  HiOutlineLocationMarker,
} from "react-icons/hi";
import { logImg, locationData, branchData, fetchLocationData } from "../../Contants/Config";

const LocationModal = ({
  isModalOpen,
  handleCloseModal,
  orderType,
  setOrderType,
  selectedCity,
  setSelectedCity,
  selectedTown,
  setSelectedTown,
}) => {
  const [showCityList, setShowCityList] = useState(false);
  const [showAreaList, setShowAreaList] = useState(false);
  const [data, setData] = useState(locationData);

  useEffect(() => {
    if (isModalOpen) {
      fetchLocationData().then(() => {
        setData({ ...locationData });
      });

      const savedLocation = localStorage.getItem("userLocation");
      if (savedLocation) {
        const parsedLocation = JSON.parse(savedLocation);
        if (typeof setSelectedCity === "function")
          setSelectedCity(parsedLocation.city || "Select City");
        if (typeof setSelectedTown === "function")
          setSelectedTown(parsedLocation.town || "Select Town");
      }
      setShowCityList(false);
      setShowAreaList(false);
    }
  }, [isModalOpen]);
  useEffect(() => {
    const checkLocation = () => {
      const saved = localStorage.getItem("userLocation");
      if (!saved) {
        props.setIsModalOpen(true);
      }
    };

    window.addEventListener("locationUpdated", checkLocation);
    return () => window.removeEventListener("locationUpdated", checkLocation);
  }, []);

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-[1.5rem] p-6 pt-8 pb-6 relative shadow-2xl animate-in fade-in zoom-in duration-300 h-fit max-h-[90vh]">
        <button
          onClick={handleCloseModal}
          disabled={selectedTown === "Select Town"}
          className={`absolute right-4 top-4 p-1 rounded-full z-10 transition-colors ${
            selectedTown === "Select Town"
              ? "text-gray-200 cursor-not-allowed"
              : "text-gray-400 hover:text-red-500 cursor-pointer"
          }`}
        >
          <IoCloseOutline size={28} />
        </button>

        <div className="flex justify-center mb-3">
          <img
            src={logImg.img}
            alt={logImg.altName}
            className="w-16 h-16 object-contain p-1 bg-[var(--primary-bg)] rounded-lg shadow-md"
          />
        </div>

        <div className="text-center mb-4">
          <h2 className="text-lg font-extrabold text-gray-800 mb-2">
            Select your order type
          </h2>
          <div className="flex justify-center cursor-pointer gap-2">
            {["Delivery", "Pick-Up"].map((type) => (
              <button
                title="Select Type"
                key={type}
                onClick={() => setOrderType(type)}
                className={`flex-1 py-2 rounded-full cursor-pointer font-bold transition-all text-sm ${
                  orderType === type
                    ? "bg-[var(--primary-bg)] text-white shadow-md"
                    : "bg-gray-100 text-gray-500 border border-gray-200"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-center border-t pt-3">
            <p className="text-sm font-bold text-gray-700 mb-2">
              Please select your location
            </p>
          </div>

          {/* City Dropdown */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-gray-600 ml-1 uppercase">
              Select City
            </label>
            <div className="relative">
              <div
                onClick={() => {
                  setShowCityList(!showCityList);
                  setShowAreaList(false);
                }}
                className="w-full bg-white border border-gray-300 p-2.5 rounded-xl font-medium text-gray-700 flex justify-between items-center text-sm cursor-pointer shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <HiOutlineOfficeBuilding
                    className="text-gray-500"
                    size={18}
                  />
                  <span
                    className={
                      !selectedCity || selectedCity === "Select City"
                        ? "text-gray-400"
                        : "text-gray-700"
                    }
                  >
                    {selectedCity || "Select City"}
                  </span>
                </div>
                <HiOutlineChevronDown
                  className={`text-gray-400 transition-transform ${showCityList ? "rotate-180" : ""}`}
                />
              </div>
              {showCityList && (
                <div className="absolute w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg z-[200] max-h-40 overflow-y-auto py-1">
                  {Object.keys(data).map((city) => (
                    <div
                      key={city}
                      onClick={() => {
                        setSelectedCity(city);
                        setSelectedTown("Select Town");
                        setShowCityList(false);
                      }}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm font-medium text-gray-700"
                    >
                      {city}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Area Dropdown */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-gray-600 ml-1 uppercase">
              Select Area
            </label>
            <div className="relative">
              <div
                onClick={() => {
                  setShowAreaList(!showAreaList);
                  setShowCityList(false);
                }}
                className="w-full bg-white border border-gray-300 p-2.5 rounded-xl font-medium text-gray-700 flex justify-between items-center text-sm cursor-pointer shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <HiOutlineLocationMarker
                    className="text-gray-400"
                    size={18}
                  />
                  <span
                    className={
                      selectedTown === "Select Town"
                        ? "text-gray-400"
                        : "text-gray-700"
                    }
                  >
                    {selectedTown}
                  </span>
                </div>
                <HiOutlineChevronDown
                  className={`text-gray-400 transition-transform ${showAreaList ? "rotate-180" : ""}`}
                />
              </div>
              {showAreaList && (
                <div className="absolute w-full top-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg z-[200] max-h-33 overflow-y-auto py-1">
                  {data[selectedCity] ? (
                    data[selectedCity].map((town) => (
                      <div
                        key={town}
                        onClick={() => {
                          setSelectedTown(town);
                          setShowAreaList(false);
                        }}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm font-medium text-gray-700"
                      >
                        {town}
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-sm text-gray-500 italic">
                      Please select a city first
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            const cityBranches = branchData[selectedCity] || [];
            const matched =
              cityBranches.find((b) => (b.areas || []).includes(selectedTown)) ||
              cityBranches[0];
            const locationObj = {
              city: selectedCity,
              town: selectedTown,
              branchId: matched?._id || "",
              type: orderType,
            };
            localStorage.setItem("userLocation", JSON.stringify(locationObj));
            window.dispatchEvent(new Event("locationUpdated"));
            handleCloseModal();
          }}
          disabled={!selectedTown || selectedTown === "Select Town"}
          className={`w-full py-3.5 mt-5 rounded-xl font-black transition-all shadow-md text-sm ${
            selectedTown === "Select Town"
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-[var(--secondary-bg)] text-black cursor-pointer"
          }`}
        >
          Confirm Location
        </button>
      </div>
    </div>
  );
};

export default LocationModal;
