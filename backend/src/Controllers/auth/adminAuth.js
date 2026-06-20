import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcryptjs from "bcryptjs";
import StaffUser from "../../Models/StaffUser.js";
import Restaurant from "../../Models/Restaurant.js";
import { sendEmail } from "../../Services/emailService.js";

const bcrypt = bcryptjs.default ?? bcryptjs;

const resolveActiveBranchId = (staff) => {
  if (staff.accountType === "staff" && staff.parentBranchId) {
    return staff.parentBranchId?._id || staff.parentBranchId;
  }
  if (staff.branchIds?.length) {
    const first = staff.branchIds[0];
    return first?._id || first;
  }
  return null;
};

const buildAuthResponse = (staff) => {
  const activeBranchId = resolveActiveBranchId(staff);
  const branchIds = (staff.branchIds || []).map((b) => b?._id || b);

  const tokenPayload = {
    id: staff._id,
    role: staff.role,
    accountType: staff.accountType,
    restaurantId: staff.restaurantId?._id || staff.restaurantId,
    branchId: activeBranchId,
    branchIds,
    permissions: staff.permissions || [],
  };

  const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "30d",
  });

  return {
    success: true,
    message: "Login successful.",
    token,
    user: {
      id: staff._id,
      name: staff.name,
      email: staff.email,
      role: staff.role,
      accountType: staff.accountType,
      restaurantId: staff.restaurantId?._id || staff.restaurantId,
      branchId: activeBranchId,
      branchIds,
      permissions: staff.permissions || [],
      avatar: staff.avatar,
      color: staff.color,
    },
  };
};

/** POST /api/admin/login */
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password required." });

    const normalizedEmail = email.toLowerCase().trim();
    let staff = await StaffUser.findOne({ email: normalizedEmail }).select("+password");

    if (staff) {
      if (staff.status === "blocked")
        return res.status(403).json({ success: false, message: "Account blocked. Contact your admin." });

      const valid = await staff.comparePassword(password);
      if (valid) {
        await StaffUser.updateOne({ _id: staff._id }, { $set: { lastLogin: new Date() } });
        staff = await StaffUser.findById(staff._id).populate("branchIds", "name city status");
        return res.status(200).json(buildAuthResponse(staff));
      }
    }

    // Fallback: credentials set by super admin on the restaurant record
    const restaurant = await Restaurant.findOne({ adminEmail: normalizedEmail }).select("+adminPassword");
    if (!restaurant?.adminPassword)
      return res.status(400).json({ success: false, message: "Invalid credentials." });

    const restaurantValid = await bcrypt.compare(password, restaurant.adminPassword);
    if (!restaurantValid)
      return res.status(400).json({ success: false, message: "Invalid credentials." });

    if (!staff) {
      staff = await StaffUser.create({
        name: restaurant.ownerName || "Restaurant Owner",
        email: normalizedEmail,
        password: "temp-sync",
        role: "client_admin",
        accountType: "client_admin",
        restaurantId: restaurant._id,
        phone: restaurant.contactNumber || "",
        avatar: (restaurant.ownerName || "RO").slice(0, 2).toUpperCase(),
        status: "active",
        branchIds: [],
      });
    }

    // Keep staff password in sync with restaurant admin credentials
    await StaffUser.collection.updateOne(
      { _id: staff._id },
      { $set: { password: restaurant.adminPassword, lastLogin: new Date() } },
    );

    staff = await StaffUser.findById(staff._id).populate("branchIds", "name city status");
    return res.status(200).json(buildAuthResponse(staff));
  } catch (err) {
    console.error("adminLogin error:", err);
    return res.status(500).json({ success: false, message: "Server error.", error: err.message });
  }
};

/** POST /api/admin/forgot-password */
export const adminForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const staff = await StaffUser.findOne({ email: email?.toLowerCase() });
    if (!staff) return res.status(200).json({ success: true, message: "If account exists, reset email sent." });

    const token = crypto.randomBytes(32).toString("hex");
    staff.resetToken       = token;
    staff.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
    await staff.save();

    const resetUrl = `${process.env.FRONTEND_URL}/admin/reset-password?token=${token}`;
    await sendEmail({
      to:      staff.email,
      subject: "Password Reset – RestaurantOS",
      html: `
        <p>Hi ${staff.name},</p>
        <p>Click the link below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="background:#f97316;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;">Reset Password</a>
        <p>If you didn't request this, ignore this email.</p>
      `,
    });

    return res.status(200).json({ success: true, message: "Reset email sent." });
  } catch (err) {
    console.error("forgotPassword error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/** POST /api/admin/reset-password */
export const adminResetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password)
      return res.status(400).json({ success: false, message: "Token and new password required." });

    const staff = await StaffUser.findOne({
      resetToken:       token,
      resetTokenExpiry: { $gt: new Date() },
    }).select("+password");

    if (!staff)
      return res.status(400).json({ success: false, message: "Invalid or expired reset link." });

    staff.password         = password;
    staff.resetToken       = null;
    staff.resetTokenExpiry = null;
    await staff.save();

    return res.status(200).json({ success: true, message: "Password updated successfully." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/** GET /api/admin/me */
export const getMe = async (req, res) => {
  try {
    const staff = await StaffUser.findById(req.user.id)
      .populate("restaurantId", "name logo color currency")
      .populate("branchIds", "name city status");

    if (!staff) return res.status(404).json({ success: false, message: "Staff not found." });

    const activeBranchId = resolveActiveBranchId(staff);
    const payload = staff.toObject();
    payload.branchId = activeBranchId;
    payload.branchIds = (payload.branchIds || []).map((b) => b?._id || b);

    return res.status(200).json({ success: true, data: payload });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
