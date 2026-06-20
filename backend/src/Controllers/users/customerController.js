import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs"; const bcrypt = bcryptjs.default ?? bcryptjs;
import crypto from "crypto";
import Customer from "../../Models/Customer.js";
import Order from "../../Models/Order.js";
import Branch from "../../Models/Branch.js";
import { sendEmail } from "../../Services/emailService.js";

// ─── Auth ─────────────────────────────────────────────────────────────────────

/** POST /api/users/signup */
export const signupCustomer = async (req, res) => {
  try {
    const { name, email, phone, city, password, restaurantId, branchId, registeredFromWebsite } = req.body;
    if (!name || !email || !phone)
      return res.status(400).json({ success: false, message: "name, email, phone required." });

    const exists = await Customer.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ success: false, message: "Account already exists with this email." });

    let passwordHash = null;
    if (password) passwordHash = await bcrypt.hash(password, 12);

    const customer = await Customer.create({
      name, phone, city: city || "",
      email: email.toLowerCase(),
      passwordHash,
      restaurantId: restaurantId || null,
      parentBranchId: branchId || null,
      registeredFromWebsite: registeredFromWebsite || "",
    });

    const token = jwt.sign(
      { id: customer._id, email: customer.email, type: "customer" },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    return res.status(201).json({ success: true, token, data: customer, message: "Account created." });
  } catch (err) {
    console.error("signupCustomer:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/** POST /api/users/login */
export const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;
    const customer = await Customer.findOne({ email: email?.toLowerCase() }).select("+passwordHash");
    if (!customer) return res.status(404).json({ success: false, message: "Account not found." });

    if (customer.passwordHash) {
      const valid = await bcrypt.compare(password || "", customer.passwordHash);
      if (!valid) return res.status(400).json({ success: false, message: "Invalid password." });
    }

    const token = jwt.sign(
      { id: customer._id, email: customer.email, type: "customer" },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    const { passwordHash, ...safeCustomer } = customer.toObject();
    return res.status(200).json({ success: true, token, data: safeCustomer });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/** POST /api/users/direct-reset — password reset via OTP email */
export const directReset = async (req, res) => {
  try {
    const { email } = req.body;
    const customer = await Customer.findOne({ email: email?.toLowerCase() });
    if (!customer) return res.status(200).json({ success: true, message: "If account exists, OTP sent." });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    customer.otp       = otp;
    customer.otpExpiry = new Date(Date.now() + 15 * 60 * 1000);
    await customer.save();

    await sendEmail({
      to: email,
      subject: "Password Reset OTP",
      html: `<p>Your OTP is: <strong>${otp}</strong> (expires in 15 minutes)</p>`,
    }).catch(() => {});

    return res.status(200).json({ success: true, message: "OTP sent." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── Customer Orders ──────────────────────────────────────────────────────────

/** POST /api/users/orders — place order (no auth required for guest checkout) */
export const createCustomerOrder = async (req, res) => {
  try {
    const {
      branchId, restaurantId,
      customerName, customerPhone, customerAddress,
      city, area, items,
      discount = 0, deliveryFee = 0,
      source = "website", type = "delivery",
      paymentMethod = "cod", note = "",
      deliveryTime = "30-45 min",
      registeredFromWebsite = "",
      taxRate = 16,
    } = req.body;

    if (!branchId) return res.status(400).json({ success: false, message: "branchId required." });
    if (!items?.length) return res.status(400).json({ success: false, message: "Order items required." });
    if (!customerName || !customerPhone)
      return res.status(400).json({ success: false, message: "Customer name and phone required." });

    const subtotal = items.reduce((s, i) => s + (i.total || i.price * i.qty), 0);
    const tax      = Math.round(subtotal * (taxRate / 100));
    const total    = subtotal + tax - discount + deliveryFee;

    // Determine if COD online order needs confirmation call
    const isOnline  = ["website","app","foodpanda","careem"].includes(source);
    const isCOD     = paymentMethod === "cod";
    const confirmStatus = isOnline && isCOD ? "pending_call" : null;

    const order = await Order.create({
      branchId, restaurantId: restaurantId || null,
      customerName, customerPhone,
      customerAddress: customerAddress || "",
      city: city || "", area: area || "",
      items: items.map(i => ({
        productId: i.productId || i._id || "",
        name: i.name, price: i.price,
        qty: i.qty || i.quantity || 1,
        total: i.total || i.price * (i.qty || 1),
        image: i.image || "",
        selectedSize: i.selectedSize || null,
        addons: i.addons || [],
        extras: i.extras || [],
        instructions: i.instructions || "",
      })),
      subtotal, tax, discount, deliveryFee, total,
      status: "pending",
      confirmStatus,
      source, type, paymentMethod,
      note, deliveryTime,
      registeredFromWebsite,
    });

    return res.status(201).json({ success: true, data: order, message: "Order placed successfully!" });
  } catch (err) {
    console.error("createCustomerOrder:", err);
    return res.status(500).json({ success: false, message: "Server error.", error: err.message });
  }
};

/** GET /api/users/orders — logged-in customer's orders */
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.customer.id })
      .sort({ createdAt: -1 })
      .limit(50);
    return res.status(200).json({ success: true, data: orders });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/** GET /api/users/profile */
export const getCustomerProfile = async (req, res) => {
  try {
    const customer = await Customer.findById(req.customer.id).select("-passwordHash");
    if (!customer) return res.status(404).json({ success: false, message: "Account not found." });
    return res.status(200).json({ success: true, data: customer });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/** PUT /api/users/profile */
export const updateCustomerProfile = async (req, res) => {
  try {
    const { password, passwordHash, ...updates } = req.body;
    const customer = await Customer.findByIdAndUpdate(req.customer.id, updates, { new: true }).select("-passwordHash");
    return res.status(200).json({ success: true, data: customer });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
