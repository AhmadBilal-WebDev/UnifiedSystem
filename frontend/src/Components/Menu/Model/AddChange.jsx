import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const AddressModal = ({ isOpen, onClose, address, setAddress }) => {
  const position = [31.5204, 74.3587];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999999] flex items-center justify-center bg-black/40 p-2 backdrop-blur-[2px]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white w-full max-w-[480px] rounded-2xl shadow-2xl relative flex flex-col overflow-hidden"
        >
          <div className="px-5 py-3 flex justify-between items-center border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800">Add new Address</h2>
          </div>

          <div className="px-6 py-4 space-y-4">
            <div className="space-y-1">
              <label className="text-[14px] font-semibold text-gray-700">
                Address (with post code if applicable)
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your complete street address"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-gray-400 text-[14px] placeholder:text-gray-400"
              />
            </div>

            <div className="w-full h-[220px] bg-gray-100 rounded-xl relative overflow-hidden border border-gray-200 z-0">
              <MapContainer
                center={position}
                zoom={13}
                scrollWheelZoom={true}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={position} />
              </MapContainer>

              <div className="absolute top-2 right-2 z-[1000]">
                <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[9px] font-black text-gray-600 border border-gray-200 uppercase">
                  Live Map
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 pb-6 pt-2">
            <button
              title="Add Adress"
              onClick={onClose}
              disabled={!address.trim()}
              className={`w-full py-3.5 cursor-pointer hover:scale-105 rounded-xl font-bold text-[14px] uppercase tracking-widest transition-all ${
                address.trim()
                  ? "bg-[var(--carts-bg-color)] text-white shadow-md active:scale-[0.98]"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              Confirm Address
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddressModal;
