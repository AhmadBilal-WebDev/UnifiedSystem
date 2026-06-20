import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const backendApi = import.meta.env.VITE_API_URL;

export function Forget({ buttonTitle = "Send Reset Link" }) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [globalError, setGlobalError] = useState("");
  const [globalSuccess, setGlobalSuccess] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError("");
    setGlobalError("");
    setGlobalSuccess("");

    if (!email.trim()) {
      setEmailError("Please enter your email address.");
      return;
    }

    setIsLoading(true);

    try {
      const base = backendApi.endsWith("/")
        ? backendApi.slice(0, -1)
        : backendApi;
      const finalUrl = `${base}/admin/forgot-password`;

      const response = await axios.post(
        finalUrl,
        { email },
        { headers: { "Content-Type": "application/json" } },
      );

      if (response.data.success) {
        setGlobalSuccess(
          response.data.message || "OTP sent successfully to your email!",
        );

        localStorage.setItem("resetEmail", email);

        setTimeout(() => {
          navigate("/admin/verify-otp");
        }, 2000);
      }
    } catch (error) {
      console.error("Forgot Password Error:", error);

      const errorMsg =
        error.response?.data?.message ||
        "Failed to send reset link. Please check your connection.";
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
        <button
          title="Back to Login"
          type="button"
          onClick={() => navigate("/admin/login")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} />
          Back to Login
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Forgot Password?
          </h1>
          <p className="text-gray-600">
            Enter your email and we'll send you a reset link
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

        {globalSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 text-sm font-medium rounded-lg text-center"
          >
            {globalSuccess}
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

          <motion.button
            title="Send OTP"
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
