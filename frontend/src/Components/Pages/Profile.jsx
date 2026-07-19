import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Edit2,
  Phone,
  MapPin,
  Save,
  Loader2,
  User,
  Calendar,
} from "lucide-react";
import Swal from "sweetalert2";
import { locationData } from "../../Contants/Config";
import { getApiBase } from "../../lib/apiBase.js";

const API = getApiBase();

const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [userData, setUserData] = useState({
    name: "",
    phone: "",
    city: "",
    createdAt: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API}/api/public/profile`, {
          withCredentials: true,
        });
        setUserData(res.data.user || res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setPageLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!userData.name.trim())
      return Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Name cannot be empty",
      });
    if (userData.phone.length !== 11)
      return Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "Phone number must be 11 digits",
      });

    try {
      await axios.put(
        `${API}/api/public/profile`,
        {
          name: userData.name,
          phone: userData.phone,
          city: userData.city,
        },
        { withCredentials: true },
      );

      setIsEditing(false);
      Swal.fire({
        icon: "success",
        title: "Profile Updated!",
        background: "#22c55e",
        color: "#fff",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (pageLoading)
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <Loader2 className="w-12 h-12 animate-spin text-[#ff4f1d]" />
      </div>
    );

  return (
    <div className="min-h-screen py-12 px-4 bg-white">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-8 bg-gray-50 text-left hover:shadow-md transition-all">
          <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-blue-100 flex items-center justify-center">
            <div className="relative w-full h-full flex flex-col items-center justify-center mt-4">
              <div className="w-12 h-12 rounded-full mb-1 bg-blue-400"></div>
              <div className="w-20 h-14 rounded-t-[2.5rem] rounded-b-lg bg-blue-400"></div>
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-black text-gray-900">
              {userData.name}
            </h1>
            <p className="font-medium text-gray-500 text-sm">Verified Member</p>
          </div>
          <button
            title={isEditing ? "Save Changes" : "Edit Profile"}
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-white shadow-lg cursor-pointer hover:scale-105 transition-all ${isEditing ? "bg-green-600" : "bg-gray-950"}`}
          >
            {isEditing ? <Save size={18} /> : <Edit2 size={18} />}{" "}
            {isEditing ? "Save Changes" : "Edit Profile"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6 hover:shadow-md transition-all">
            <h3 className="text-sm font-black uppercase text-gray-400">
              Account Info
            </h3>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-100 rounded-2xl text-gray-600">
                <User size={20} />
              </div>
              <div className="w-full">
                <p className="text-[10px] font-black text-gray-400 uppercase">
                  Name
                </p>
                {isEditing ? (
                  <input
                    value={userData.name}
                    onChange={(e) =>
                      setUserData({ ...userData, name: e.target.value })
                    }
                    className="w-full border-b-2 border-[#ff4f1d] outline-none font-bold text-lg"
                  />
                ) : (
                  <p className="text-lg font-bold">{userData.name}</p>
                )}
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-100 rounded-2xl text-gray-600">
                <Phone size={20} />
              </div>
              <div className="w-full">
                <p className="text-[10px] font-black text-gray-400 uppercase">
                  Phone
                </p>
                {isEditing ? (
                  <input
                    type="number"
                    value={userData.phone}
                    onChange={(e) =>
                      setUserData({ ...userData, phone: e.target.value })
                    }
                    className="w-full border-b-2 border-[#ff4f1d] outline-none font-bold text-lg"
                  />
                ) : (
                  <p className="text-lg font-bold">{userData.phone || "N/A"}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6 hover:shadow-md transition-all">
            <h3 className="text-sm font-black uppercase text-gray-400">
              System Details
            </h3>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-100 rounded-2xl text-gray-600">
                <MapPin size={20} />
              </div>
              <div className="w-full">
                <p className="text-[10px] font-black text-gray-400 uppercase">
                  City
                </p>
                {isEditing ? (
                  <select
                    value={userData.city}
                    onChange={(e) =>
                      setUserData({ ...userData, city: e.target.value })
                    }
                    className="w-full border-b-2 border-[#ff4f1d] outline-none font-bold text-lg bg-transparent cursor-pointer"
                  >
                    <option value="">Select City</option>
                    {Object.keys(locationData).map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-lg font-bold">{userData.city || "N/A"}</p>
                )}
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-100 rounded-2xl text-gray-600">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase">
                  Joined Date
                </p>
                <p className="text-lg font-bold text-gray-800">
                  {new Date(userData.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
