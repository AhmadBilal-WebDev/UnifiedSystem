import React, { useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { getApiBase } from "../../lib/apiBase.js";

const API = getApiBase();

const LoginModal = ({ isOpen, onClose, openRegister, setUser }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${API}/login`,
        { email },
        { withCredentials: true },
      );

      if (response.status === 200 && response.data.user) {
        localStorage.setItem("userInfo", JSON.stringify(response.data.user));

        if (setUser) setUser(response.data.user);

        window.dispatchEvent(new Event("userLoginStatusChange"));
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Logged In Successfully!",
          showConfirmButton: false,
          timer: 2000,
          background: "#22c55e",
          color: "#fff",
        });

        setEmail("");
        onClose();
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Login failed. Please check your email.",
      );
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
          className="relative bg-white w-full max-w-[400px] rounded-[15px] p-8 shadow-2xl z-10"
        >
          <button
            onClick={onClose}
            title="Close"
            className="absolute right-4 top-4 text-gray-500 hover:text-black transition-colors cursor-pointer active:scale-90"
          >
            <div className="bg-gray-100 rounded-full p-1 shadow-sm hover:shadow-md transition-all">
              <X size={20} strokeWidth={3} />
            </div>
          </button>

          <h2 className="text-[20px] font-bold text-gray-800 mb-1">
            Enter your email address
          </h2>
          <p className="text-gray-500 text-sm mb-6 font-medium">
            Please enter your email address to log in
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Enter your email address"
                className={`w-full border rounded-lg p-3 outline-none transition-all shadow-sm ${
                  error
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 focus:border-[var(--Authentication-bg-color)]"
                }`}
              />

              {error && (
                <p className="text-red-500 text-[12px] font-bold mt-1 ml-1">
                  {error}
                </p>
              )}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate("/update-email");
                  }}
                  title="Recover Email"
                  className="text-[13px] font-bold text-gray-500 hover:text-black transition-colors cursor-pointer hover:underline"
                >
                  Update Email?
                </button>
              </div>
            </div>

            <button
              title="Click to Login"
              type="submit"
              disabled={loading}
              className="relative overflow-hidden w-full text-white font-extrabold py-3 rounded-lg shadow-[0_4px_15px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.2)] active:scale-[0.96] cursor-pointer transition-all duration-300 ease-in-out group disabled:opacity-50"
              style={{ backgroundColor: "var(--Authentication-bg-color)" }}
            >
              <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-all duration-[0.8s] group-hover:left-[100%] ease-in-out" />

              <span className="relative z-10">
                {loading ? "Logging in..." : "Login"}
              </span>
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-[14px] text-gray-600 font-medium">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={openRegister}
                title="Create new account"
                className="font-bold hover:underline ml-1 cursor-pointer transition-all hover:scale-105 active:scale-95"
                style={{ color: "var(--Authentication-bg-color)" }}
              >
                Register
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LoginModal;
