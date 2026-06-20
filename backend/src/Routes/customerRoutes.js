import express from "express";
import verifyCustomerToken from "../Middleware/verifyCustomerToken.js";
import {
  signupCustomer,
  loginCustomer,
  directReset,
  createCustomerOrder,
  getMyOrders,
  getCustomerProfile,
  updateCustomerProfile,
} from "../Controllers/users/customerController.js";

const router = express.Router();

// ─── Auth ─────────────────────────────────────────────────────────────────────
router.post("/api/users/signup",       signupCustomer);
router.post("/api/users/login",        loginCustomer);
router.post("/api/users/direct-reset", directReset);

// ─── Orders (guest or logged-in) ─────────────────────────────────────────────
router.post("/api/users/orders",  createCustomerOrder);   // guest checkout OK
router.get( "/api/users/orders",  verifyCustomerToken, getMyOrders);

// ─── Profile ──────────────────────────────────────────────────────────────────
router.get("/api/users/profile",  verifyCustomerToken, getCustomerProfile);
router.put("/api/users/profile",  verifyCustomerToken, updateCustomerProfile);

export default router;