import React, { useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { locationData } from "../../Contants/Config";
import axios from "axios";
import Swal from "sweetalert2";

const RegisterModal = ({ isOpen, onClose, openLogin, setUser }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    city: "",
  });
  const [errors, setErrors] = useState({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    let newErrors = {};
    if (!formData.fullName) newErrors.fullName = "Full name is required";
    if (!formData.email) newErrors.email = "Email is required";
    // 10 digits validation for mobile
    if (!/^\d{11}$/.test(formData.mobile))
      newErrors.mobile = "Mobile must be 11 digits";
    if (!formData.city) newErrors.city = "Please select a city";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const websiteUrl = window.location.origin;
      const payload = {
        name: formData.fullName,
        email: formData.email,
        phone: formData.mobile,
        city: formData.city,
        registeredFromWebsite: websiteUrl,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/signup`,
        payload,
        { withCredentials: true },
      );

      if (response.status === 201) {
        localStorage.setItem("userInfo", JSON.stringify(response.data.user));
        if (setUser) setUser(response.data.user);

        Swal.fire({
          position: "center",
          icon: "success",
          title: "Registration Successful!",
          showConfirmButton: false,
          timer: 2000,
          background: "#22c55e",
          color: "#fff",
        });

        setFormData({ fullName: "", email: "", mobile: "", city: "" });
        onClose();
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text:
          error.response?.data?.message || "Registration failed. Try again.",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative bg-white w-full max-w-[400px] rounded-[20px] p-8 shadow-2xl z-10"
        >
          <button
            title="Close"
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-black transition-colors cursor-pointer"
          >
            <div className="bg-gray-100 rounded-full p-1">
              <X size={20} strokeWidth={3} />
            </div>
          </button>

          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Register
          </h2>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-[var(--Authentication-bg-color)]"
                placeholder="Enter your name"
              />
              {errors.fullName && (
                <p className="text-red-500 text-[11px] mt-1">
                  {errors.fullName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-[var(--Authentication-bg-color)]"
                placeholder="email@example.com"
              />
              {errors.email && (
                <p className="text-red-500 text-[11px] mt-1">{errors.email}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1">
                  Mobile
                </label>
                <div className="flex border border-gray-300 rounded-lg overflow-hidden focus-within:border-[var(--Authentication-bg-color)]">
                  <div className="flex items-center px-2 bg-gray-50 border-r border-gray-200">
                    <span className="text-[13px] font-bold">+92</span>
                  </div>
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    className="w-full p-2 text-[14px] outline-none"
                    placeholder="3001234567"
                  />
                </div>
                {errors.mobile && (
                  <p className="text-red-500 text-[11px] mt-1">
                    {errors.mobile}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1">
                  Location
                </label>
                <div className="relative">
                  <div
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full p-2 border border-gray-300 rounded-lg cursor-pointer bg-white text-sm h-[40px] flex items-center"
                  >
                    <span
                      className={formData.city ? "text-black" : "text-gray-400"}
                    >
                      {formData.city ? formData.city : "Select City"}
                    </span>
                  </div>
                  {isDropdownOpen && (
                    <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-[9999] max-h-[120px] overflow-y-auto">
                      {Object.keys(locationData).map((cityName) => (
                        <div
                          key={cityName}
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              city: cityName,
                            }));
                            setIsDropdownOpen(false);
                          }}
                          className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100"
                        >
                          {cityName}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {errors.city && (
                  <p className="text-red-500 text-[11px] mt-1">{errors.city}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-extrabold py-3 rounded-lg mt-2 cursor-pointer transition-all duration-300 disabled:opacity-50"
              style={{ backgroundColor: "var(--Authentication-bg-color)" }}
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-[14px] text-gray-600 font-medium">
              Already have an account?{" "}
              <button
                onClick={openLogin}
                className="font-bold hover:underline ml-1 cursor-pointer"
                style={{ color: "var(--Authentication-bg-color)" }}
              >
                Login Here
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default RegisterModal;
