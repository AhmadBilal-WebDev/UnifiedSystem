import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const backendApi = import.meta.env.VITE_API_URL;

import { logImg } from "../../../Contants/Config";

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

const isTokenValid = (token) => {
  if (!token) return false;
  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
    );
    return payload.exp ? payload.exp * 1000 > Date.now() : true;
  } catch (error) {
    return false;
  }
};

export function Login({ onLogin, buttonTitle = "Sign In" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [globalError, setGlobalError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const cookieToken = getCookie("adminToken");
    if (cookieToken && isTokenValid(cookieToken)) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setEmailError("");
    setPasswordError("");
    setGlobalError("");

    let hasError = false;

    if (!email.trim()) {
      setEmailError("Please enter your email address.");
      hasError = true;
    }

    if (!password.trim()) {
      setPasswordError("Please enter your password.");
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      hasError = true;
    }

    if (hasError) return;

    setIsLoading(true);

    try {
      const base = backendApi.endsWith("/")
        ? backendApi.slice(0, -1)
        : backendApi;
      const finalUrl = `${base}/admin/login`;

      console.log("Hitting API Endpoint:", finalUrl);

      const response = await axios.post(
        finalUrl,
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        },
      );

      if (response.data.success) {
        const { token, user } = response.data;

        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString();
        document.cookie = `adminToken=${token}; expires=${expires}; path=/; SameSite=Lax`;

        localStorage.setItem("adminToken", token);
        localStorage.setItem("adminUser", JSON.stringify(user));

        if (onLogin) {
          onLogin(email, password, user.role);
        }

        navigate("/admin/dashboard");
      }
    } catch (error) {
      console.error("Axios Login Error Context:", error);

      const errorMsg =
        error.response?.data?.message ||
        "Network connection failed or CORS blocked. Check console.";
      setGlobalError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 flex items-center justify-center mx-auto mb-4"
          >
            <img
              src={logImg.img}
              alt={logImg.altName}
              className="w-full h-full bg-[var(--primary-bg)] rounded-full object-contain"
            />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">Restaurant Management System</p>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError("");
                }}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  emailError
                    ? "border-red-500 ring-1 ring-red-500"
                    : "border-gray-300"
                }`}
                placeholder="admin@example.com"
              />
            </div>
            {emailError && (
              <p className="text-xs text-red-500 mt-2 font-medium pl-1">
                {emailError}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError("");
                }}
                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  passwordError
                    ? "border-red-500 ring-1 ring-red-500"
                    : "border-gray-300"
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {passwordError && (
              <p className="text-xs text-red-500 mt-2 font-medium pl-1">
                {passwordError}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end">
            <motion.button
              title="Reset your Password"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                navigate("/admin/forget");
              }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer block"
            >
              Forgot Password?
            </motion.button>
          </div>

          <motion.button
            title="Login your Account"
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
      </motion.div>
    </div>
  );
}
