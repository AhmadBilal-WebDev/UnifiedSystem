import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, KeyRound, CheckCircle, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { getApiBase } from "../../../lib/apiBase.js";
const backendApi = getApiBase();

export function VerifyOTP({ buttonTitle = "Reset Password", onResetSuccess }) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const [otpError, setOtpError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [globalError, setGlobalError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem("resetEmail");
    if (savedEmail) {
      setEmail(savedEmail);
    } else {
      setGlobalError("Email session not found. Please request a new OTP.");
    }
  }, []);

  const handleBackToLogin = () => {
    setIsNavigating(true);
    setTimeout(() => {
      localStorage.removeItem("resetEmail");
      navigate("/admin/login");
    }, 800);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setOtpError("");
    setPasswordError("");
    setGlobalError("");

    let hasError = false;

    if (!email) {
      setGlobalError(
        "Email is missing. Please go back and enter your email again.",
      );
      return;
    }

    if (!otp.trim()) {
      setOtpError("Please enter the OTP code sent to your email.");
      hasError = true;
    }

    if (!newPassword.trim()) {
      setPasswordError("Please enter your new password.");
      hasError = true;
    } else if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      hasError = true;
    }

    if (hasError) return;

    setIsLoading(true);

    try {
      const base = (backendApi || "").endsWith("/")
        ? backendApi.slice(0, -1)
        : backendApi || "";
      const finalUrl = `${base}/api/admin/reset-password`;

      const response = await axios.post(
        finalUrl,
        {
          email,
          otp,
          password: newPassword,
        },
        { headers: { "Content-Type": "application/json" } },
      );

      if (response.data.success) {
        setIsSubmitted(true);
        if (onResetSuccess) onResetSuccess();
      }
    } catch (error) {
      console.error("Reset Password Error:", error);
      const errorMsg =
        error.response?.data?.message ||
        "Something went wrong. Please verify your OTP and try again.";
      setGlobalError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
      >
        {!isSubmitted ? (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Verify OTP
              </h1>
              <p className="text-gray-600">
                OTP sent to your email. Enter code and set your new password
              </p>
            </div>

            {globalError && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-lg text-center"
              >
                {globalError}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Resetting Password For
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 bg-gray-50 text-gray-500 rounded-lg cursor-not-allowed outline-none"
                    placeholder="admin@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OTP Code
                </label>
                <div className="relative">
                  <KeyRound
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value);
                      if (otpError) setOtpError("");
                    }}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      otpError
                        ? "border-red-500 ring-1 ring-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter OTP"
                  />
                </div>
                {otpError && (
                  <p className="text-xs text-red-500 mt-2 font-medium pl-1">
                    {otpError}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (passwordError) setPasswordError("");
                    }}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      passwordError
                        ? "border-red-500 ring-1 ring-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="••••••••"
                  />
                </div>
                {passwordError && (
                  <p className="text-xs text-red-500 mt-2 font-medium pl-1">
                    {passwordError}
                  </p>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
              >
                {isLoading ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  buttonTitle
                )}
              </motion.button>
            </form>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle className="text-green-600" size={40} />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Password Reset Successful
            </h2>
            <p className="text-gray-600 mb-6">
              Your password has been changed successfully. You can now log in
              with your new password.
            </p>

            <button
              title="Back to Login Screen"
              type="button"
              disabled={isNavigating}
              onClick={handleBackToLogin}
              className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer flex items-center justify-center mx-auto gap-2 min-h-[24px] disabled:opacity-50"
            >
              {isNavigating ? (
                <svg
                  className="animate-spin h-4 w-4 text-blue-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                "Back to Login"
              )}
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
