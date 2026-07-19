import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
const bcrypt = bcryptjs.default ?? bcryptjs;
import Customer from "../../Models/Customer.js";
import Branch from "../../Models/Branch.js";

const setAuthCookie = (res, customerId) => {
  const token = jwt.sign({ id: customerId, type: "customer" }, process.env.JWT_SECRET, { expiresIn: "30d" });
  const isProd = process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
};

/** POST /login — old customer site, email-only login (no password if not set) */
export const loginUser = async (req, res) => {
  try {
    const email = req.body.email ? req.body.email.toLowerCase().trim() : "";
    if (!email) return res.status(400).json({ message: "Email field is required" });

    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(401).json({ message: "No account found with this email. Please register first." });
    }

    setAuthCookie(res, customer._id);
    return res.status(200).json({
      message: "Login Successful!",
      user: {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        city: customer.city,
        registeredFromWebsite: customer.registeredFromWebsite,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};

/** POST /signup */
export const signUpUser = async (req, res) => {
  try {
    const { name, email, phone, city, registeredFromWebsite } = req.body;
    if (!name || !email || !phone) {
      return res.status(400).json({ message: "Name, email, and phone are required." });
    }

    const cleanEmail = email.toLowerCase().trim();
    const exists = await Customer.findOne({ email: cleanEmail });
    if (exists) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    // Look up the matching branch by city so this customer is correctly
    // attributed to a restaurant/branch (needed for dashboard stats and
    // customer reports — without this, signups would never be counted).
    let restaurantId = null;
    let parentBranchId = null;
    if (city) {
      const branch = await Branch.findOne({ city: { $regex: new RegExp(`^${city.trim()}$`, "i") } });
      if (branch) {
        restaurantId = branch.restaurantId;
        parentBranchId = branch._id;
      }
    }

    const customer = await Customer.create({
      name, phone, city: city || "",
      email: cleanEmail,
      registeredFromWebsite: registeredFromWebsite || "",
      restaurantId,
      parentBranchId,
    });

    setAuthCookie(res, customer._id);
    return res.status(201).json({
      message: "Account created successfully!",
      user: {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        city: customer.city,
        registeredFromWebsite: customer.registeredFromWebsite,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};

/** POST /logout */
export const logoutUser = (req, res) => {
  res.cookie("jwt", "", { httpOnly: true, expires: new Date(0) });
  return res.status(200).json({ message: "Logged out successfully." });
};

/** GET /profile */
export const getUserProfile = async (req, res) => {
  return res.status(200).json({
    user: {
      _id: String(req.customer?._id || ""),
      name: req.customer?.name || "",
      email: req.customer?.email || "",
      phone: req.customer?.phone || "",
      city: req.customer?.city || "",
      registeredFromWebsite: req.customer?.registeredFromWebsite || "",
      createdAt: req.customer?.createdAt || null,
    },
  });
};

/** PUT /profile */
export const updateUserProfile = async (req, res) => {
  try {
    const { password, passwordHash, ...updates } = req.body;
    const customer = await Customer.findByIdAndUpdate(
      req.customer.id || req.customer._id,
      updates,
      { new: true }
    ).select("-passwordHash");
    return res.status(200).json({ message: "Profile updated.", user: customer });
  } catch (error) {
    return res.status(500).json({ message: "Server error." });
  }
};

/** DELETE /delete-account */
export const deleteAccount = async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.customer.id || req.customer._id);
    res.cookie("jwt", "", { httpOnly: true, expires: new Date(0) });
    return res.status(200).json({ message: "Account deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Server error." });
  }
};

/** POST /direct-reset — sets a new password directly by email (old site's simple flow) */
export const directResetEmail = async (req, res) => {
  try {
    const { email, newEmail } = req.body;
    const customer = await Customer.findOne({ email: email?.toLowerCase().trim() });
    if (!customer) return res.status(404).json({ message: "Account not found." });

    if (newEmail) {
      customer.email = newEmail.toLowerCase().trim();
      await customer.save();
    }
    return res.status(200).json({ message: "Email updated successfully.", user: customer });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};
