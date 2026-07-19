/**
 * Bridge Routes — Customer Website
 * All these routes read/write to the SAME Customer, Order, Category, Product,
 * Branch and Restaurant collections that the Owner Dashboard uses.
 */
import express from "express";

import {
  loginUser, signUpUser, logoutUser,
  getUserProfile, updateUserProfile,
  deleteAccount, directResetEmail,
} from "../Controllers/public/customerAuth.js";

import {
  getMyOrders, clearAllOrders, getOrderById, cancelOrder,
} from "../Controllers/public/customerOrders.js";

import createPublicOrder   from "../Controllers/public/createPublicOrder.js";
import getPublicMenu       from "../Controllers/public/getPublicMenu.js";
import getPublicBranches   from "../Controllers/public/getPublicBranches.js";
import customerCookieAuth  from "../Middleware/customerCookieAuth.js";

const router = express.Router();

// ── Auth ──────────────────────────────────────────────────────────
router.post("/login",          loginUser);
router.post("/signup",         signUpUser);
router.post("/logout",         logoutUser);
router.post("/direct-reset",   directResetEmail);

// ── Orders (place + manage) ──────────────────────────────────────
router.post(  "/create",                createPublicOrder);
router.get(   "/myorders",     customerCookieAuth, getMyOrders);
router.delete("/myorders/clear-all", customerCookieAuth, clearAllOrders);

// ── Profile (must be before /:id) ───────────────────────────────
router.get(   "/profile",         customerCookieAuth, getUserProfile);
router.put(   "/profile",         customerCookieAuth, updateUserProfile);
router.delete("/delete-account",  customerCookieAuth, deleteAccount);

// Same handlers under /api/* so Vercel SPA route /profile is not shadowed
router.get(   "/api/public/profile",        customerCookieAuth, getUserProfile);
router.put(   "/api/public/profile",        customerCookieAuth, updateUserProfile);
router.delete("/api/public/delete-account", customerCookieAuth, deleteAccount);

router.get(   "/orders/:id",          customerCookieAuth, getOrderById);
router.delete("/orders/:id",          customerCookieAuth, cancelOrder);

// ── Public Menu & Branches (live data from dashboard) ───────────────
router.get("/user/menu",      getPublicMenu);
router.get("/store/menu",     getPublicMenu);
router.get("/user/branches",  getPublicBranches);

export default router;
