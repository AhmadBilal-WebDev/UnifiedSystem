import jwt from "jsonwebtoken";
import crypto from "crypto";
import StaffUser from "../../Models/StaffUser.js";
import { sendEmail } from "../../Services/emailService.js";

/** POST /api/admin/login */
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password required." });

    const staff = await StaffUser.findOne({ email: email.toLowerCase() }).select("+password");
    if (!staff)
      return res.status(404).json({ success: false, message: "No account found with this email." });

    if (staff.status === "blocked")
      return res.status(403).json({ success: false, message: "Account blocked. Contact your admin." });

    const valid = await staff.comparePassword(password);
    if (!valid)
      return res.status(400).json({ success: false, message: "Invalid credentials." });

    // Update last login — use updateOne (not save()) so this never fails
    // due to legacy/invalid data sitting in unrelated fields on this document
    // (e.g. a stale status value from before this schema existed).
    await StaffUser.updateOne({ _id: staff._id }, { $set: { lastLogin: new Date() } });

    // Resolve the effective branchId
    let activeBranchId = null;
    if (staff.accountType === "staff" && staff.parentBranchId) {
      activeBranchId = staff.parentBranchId;
    } else if (staff.branchIds?.length) {
      activeBranchId = staff.branchIds[0];
    }

    const tokenPayload = {
      id:           staff._id,
      role:         staff.role,
      accountType:  staff.accountType,
      restaurantId: staff.restaurantId,
      branchId:     activeBranchId,
      branchIds:    staff.branchIds,
      permissions:  staff.permissions,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "30d",
    });

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id:           staff._id,
        name:         staff.name,
        email:        staff.email,
        role:         staff.role,
        accountType:  staff.accountType,
        restaurantId: staff.restaurantId,
        branchId:     activeBranchId,
        branchIds:    staff.branchIds,
        permissions:  staff.permissions,
        avatar:       staff.avatar,
        color:        staff.color,
      },
    });
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
    // Always return 200 to avoid email enumeration
    if (!staff) return res.status(200).json({ success: true, message: "If account exists, reset email sent." });

    const token = crypto.randomBytes(32).toString("hex");
    staff.resetToken       = token;
    staff.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
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

    staff.password         = password; // pre-save hook will hash it
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
    return res.status(200).json({ success: true, data: staff });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
