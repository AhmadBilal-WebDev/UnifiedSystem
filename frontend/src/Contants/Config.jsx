import { MdShoppingBag, MdPerson } from "react-icons/md";
import { FaClipboardList, FaCog } from "react-icons/fa";
import { IoHome } from "react-icons/io5";
import axios from "axios";
import logoImg from "../assets/crust_trust_logo.png";

export let locationData = {};
export let branchData = {};

export const fetchLocationData = async () => {
  try {
    const host = window.location.origin;
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/user/branches?domain=${encodeURIComponent(host)}`,
    );

    locationData = {};
    branchData = {};

    res.data.forEach((item) => {
      if (!item.city) return;
      const city = item.city;
      const areas = Array.isArray(item.areas) ? item.areas : [];

      locationData[city] = Array.from(
        new Set([...(locationData[city] || []), ...areas]),
      );

      branchData[city] = branchData[city] || [];
      branchData[city].push({
        _id: item._id,
        branchName: item.branchName || item.city,
        areas,
      });
    });

    console.log("Data loaded for domain:", host, {
      locationData,
      branchData,
    });
  } catch (err) {
    console.error("Error fetching locations:", err);
  }
};

// * logo Img
export const logImg = {
  img: logoImg,
  altName: "DelightCrust Logo",
};

// * resturant name
export const title_name = {
  firstName: "Delight",
  secondName: "Crust",
};

// * background img
export const section_bg_img =
  "https://www.transparenttextures.com/patterns/food.png";

// * add to cart btn
export const cart_btn = {
  text: "Add To Cart",
  style:
    "bg-white text-black font-bold shadow-md cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-gray-50 active:scale-94",
};
// * Delivery Fee

export const DELIVERY_FEE = 50;
export const FREE_DELIVERY_TEXT = "You've got FREE delivery!";
// * Whatapp Number

export const CONTACT_CONFIG = {
  whatsappNumber: "9242111200400",
  whatsappMessage: "Hello, I need some help!",
};

// * Contact Number

export const contactConfig = {
  branches: [
    {
      id: 1,
      name: "Renala Khurd Branch",
      address: "Welcome Road, Renala Khurd",
      phone: "0327-811 22 22",
    },
    {
      id: 2,
      name: "Pattoki Branch",
      address: "Brandsway Mall, Opp Punjab College, Pattoki",
      phone: "0305-811 22 22",
    },
  ],
  serviceHours: {
    days: "Monday - Sunday",
    time: "10:00 AM - 03:00 AM",
  },
  legal: {
    email: "legal@delightcrust.com",
    phone: "+92 300 1234567",
    businessHours: "Mon-Fri, 9:00 AM to 6:00 PM.",
  },
};

//* Banner Imgs
export const slides = [
  {
    url: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1965&auto=format&fit=crop",
    title: "The OG Burger",
    tag: "Flame Grilled",
    color: "#D44A1C",
  },
  {
    url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=2070&auto=format&fit=crop",
    title: "Cheesy Pizza",
    tag: "Freshly Baked",
    color: "#FFB800",
  },
  {
    url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop",
    title: "Pure Flavors",
    tag: "Premium Quality",
    color: "#4CAF50",
  },
];

// * Explore The Menu

export const exploreTheMenu = {
  tagText: "Fresh & Tasty",
  titleName: "Explore The Menu",
};
// * User Profile

export const profileMenuConfig = [
  { to: "/", icon: IoHome, label: "Go Home" },

  { to: "/profile", icon: MdPerson, label: "My Profile" },

  { to: "/my-orders", icon: FaClipboardList, label: "My Orders" },
  { to: "/settings", icon: FaCog, label: "My Settings" },
];
// //
