import React, { useState } from "react";
import { Mail, Phone, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

const ForgetPassword = () => {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const food_bg =
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop";

  const validateForm = () => {
    let tempErrors = {};
    const emailRegex = /\S+@\S+\.\S+/;

    if (!phoneNumber) {
      tempErrors.phoneNumber = "Phone number is required";
    }
    if (!newEmail) {
      tempErrors.newEmail = "New email is required";
    } else if (!emailRegex.test(newEmail)) {
      tempErrors.newEmail = "Invalid email format";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/direct-reset", {
        phoneNumber,
        newEmail,
      });

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: response.data.message,
        confirmButtonText: "Back",
        background: "#22c55e",
        color: "#fff",
        iconColor: "#fff",
      }).then(() => {
        navigate("/");
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to update email",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-black relative">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${food_bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.5,
        }}
      ></div>

      {/* Main Card - Center alignment fix ke liye flex item ki properties */}
      <div className="max-w-md w-full z-10">
        <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 p-8 md:p-12 animate-in zoom-in duration-500">
          <div className="flex flex-col items-center text-center mb-8">
            <h3
              className="text-3xl font-black uppercase italic tracking-tighter"
              style={{ color: "var(--Authentication-bg-color)" }}
            >
              Recover <span style={{ color: "#000" }}>Email</span>
            </h3>
            <p className="text-gray-500 font-bold text-[10px] uppercase tracking-[0.2em] mt-3">
              Verify phone number to update your email
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <input
                type="text"
                placeholder="Registered Phone Number"
                className="w-full px-3 py-4 border border-gray-300 rounded-xl outline-none  text-black placeholder:text-gray-400 focus:border-[var(--Authentication-bg-color)] transition-all"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  if (errors.phoneNumber)
                    setErrors({ ...errors, phoneNumber: "" });
                }}
              />
              {errors.phoneNumber && (
                <p className="text-red-500 text-xs font-bold mt-1">
                  {errors.phoneNumber}
                </p>
              )}
            </div>

            <div className="relative">
              <input
                type="email"
                placeholder="Enter New Email Address"
                className="w-full px-3 py-4 border border-gray-300 rounded-xl outline-none  text-black placeholder:text-gray-400 focus:border-[var(--Authentication-bg-color)] transition-all"
                value={newEmail}
                onChange={(e) => {
                  setNewEmail(e.target.value);
                  if (errors.newEmail) setErrors({ ...errors, newEmail: "" });
                }}
              />
              {errors.newEmail && (
                <p className="text-red-500 text-xs font-bold mt-1">
                  {errors.newEmail}
                </p>
              )}
            </div>

            <button
              title="Update your account email"
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-bold text-white shadow-md active:scale-[0.98] hover:scale-[1.02] transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "var(--Authentication-bg-color)" }}
            >
              {loading ? "Updating..." : "Update Account Email"}
            </button>
          </form>

          <button
            title="Go back to Home"
            onClick={() => navigate("/")}
            className="mt-6 flex items-center justify-center gap-2 w-full text-gray-500 font-bold uppercase text-[12px] hover:text-black hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            <ArrowLeft size={16} /> Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;
