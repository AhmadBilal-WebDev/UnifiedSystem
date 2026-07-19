import StaffUser from "../../Models/StaffUser.js";
import { sendEmail } from "../../Services/emailService.js";
import crypto from "crypto";

const STAFF_ROLES = ["branch_manager", "counter", "editor", "viewer", "kitchen"];

const ROLE_DEFAULT_PERMISSIONS = {
  branch_manager: [
    "orders.view", "orders.create", "orders.accept", "orders.reject", "orders.advance",
    "products.view", "products.create", "products.edit", "products.toggle",
    "categories.view", "branches.view",
    "staff.view", "staff.create", "staff.edit",
    "inventory.view", "inventory.create", "inventory.edit", "inventory.restock",
    "analytics.view", "reports.view",
    "counter.view", "counter.accept", "counter.reject", "counter.call_log",
    "kitchen.view", "kitchen.advance", "pos.view", "pos.sync",
  ],
  counter: [
    "orders.view", "orders.create", "orders.accept", "orders.reject",
    "counter.view", "counter.accept", "counter.reject", "counter.call_log", "pos.view",
  ],
  editor: [
    "products.view", "products.create", "products.edit", "products.toggle",
    "categories.view", "categories.create", "categories.edit",
    "inventory.view", "inventory.edit",
  ],
  viewer: ["orders.view", "analytics.view", "reports.view"],
  kitchen: ["orders.view", "kitchen.view", "kitchen.advance"],
};

/**
 * GET /api/admin/staff
 * client_admin: see all staff under their restaurantId
 * branch_manager: see staff of their branch
 */
export const getStaff = async (req, res) => {
  try {
    const { role, restaurantId, branchId } = req.user;
    let filter = {};

    if (role === "superadmin") {
      if (req.query.restaurantId) filter.restaurantId = req.query.restaurantId;
    } else if (role === "client_admin") {
      filter.restaurantId = restaurantId;
      filter.accountType = "staff";
    } else {
      filter.parentBranchId = branchId;
    }

    const staff = await StaffUser.find(filter)
      .populate("restaurantId", "name")
      .populate("branchIds", "name city")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: staff });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * POST /api/admin/staff  — invite / create a staff member
 * Body: { name, email, role, branchIds, permissions, phone }
 */
export const createStaff = async (req, res) => {
  try {
    const { restaurantId, branchId } = req.user;
    const { name, email, role, branchIds, permissions, phone, password: ownerPassword } = req.body;

    if (!name || !email || !role)
      return res.status(400).json({ success: false, message: "name, email, role required." });

    if (!STAFF_ROLES.includes(role))
      return res.status(400).json({ success: false, message: "Invalid staff role." });

    const ownerRestaurantId = restaurantId || req.body.restaurantId;
    if (!ownerRestaurantId)
      return res.status(400).json({ success: false, message: "restaurantId required." });

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await StaffUser.findOne({ email: normalizedEmail });
    if (existing)
      return res.status(409).json({ success: false, message: "An account with this email already exists." });

    const resolvedBranchIds = (branchIds?.length ? branchIds : (branchId ? [branchId] : []));
    if (resolvedBranchIds.length === 0)
      return res.status(400).json({ success: false, message: "At least one branch must be assigned." });

    let tempPassword = typeof ownerPassword === "string" ? ownerPassword.trim() : "";
    if (tempPassword) {
      if (tempPassword.length < 6)
        return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
    } else {
      tempPassword = crypto.randomBytes(4).toString("hex") + "A1";
    }

    const resolvedPermissions =
      permissions?.length > 0
        ? permissions
        : ROLE_DEFAULT_PERMISSIONS[role] || [];

    const staff = await StaffUser.create({
      name: name.trim(),
      email: normalizedEmail,
      password: tempPassword,
      role,
      accountType: "staff",
      restaurantId: ownerRestaurantId,
      branchIds: resolvedBranchIds,
      parentBranchId: resolvedBranchIds[0],
      permissions: resolvedPermissions,
      phone: phone || "",
      avatar: name.trim().split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2),
      color: req.body.color || "#6366f1",
      status: "active",
    });

    const loginUrl = `${process.env.FRONTEND_URL}/admin`;
    const emailResult = await sendEmail({
      to: normalizedEmail,
      subject: "Your RestaurantOS staff account",
      html: `
        <p>Hi ${name},</p>
        <p>You have been added as <strong>${role.replace("_", " ")}</strong>.</p>
        <p><strong>Login URL:</strong> <a href="${loginUrl}">${loginUrl}</a></p>
        <p><strong>Email:</strong> ${normalizedEmail}</p>
        <p><strong>Temporary Password:</strong> ${tempPassword}</p>
        <p>Please sign in and change your password from Settings.</p>
      `,
    });

    const emailSent = emailResult?.sent === true;

    return res.status(201).json({
      success: true,
      data: staff,
      tempPassword,
      emailSent,
      loginUrl,
      credentials: {
        email: normalizedEmail,
        password: tempPassword,
        loginUrl,
      },
      message: emailSent
        ? `Staff invited. Login details emailed to ${normalizedEmail}.`
        : `Staff created. Copy the password below and share it with ${name}.`,
    });
  } catch (err) {
    console.error("createStaff error:", err);
    return res.status(500).json({ success: false, message: "Server error.", error: err.message });
  }
};

/**
 * PATCH /api/admin/staff/:id/reset-password
 * Owner resets a staff member's password and optionally emails it.
 */
export const resetStaffPassword = async (req, res) => {
  try {
    const staff = await StaffUser.findById(req.params.id);
    if (!staff) return res.status(404).json({ success: false, message: "Staff not found." });

    if (staff.accountType !== "staff")
      return res.status(400).json({ success: false, message: "Can only reset passwords for staff accounts." });

    const { restaurantId } = req.user;
    if (restaurantId && String(staff.restaurantId) !== String(restaurantId))
      return res.status(403).json({ success: false, message: "Not allowed." });

    const ownerPassword = typeof req.body?.password === "string" ? req.body.password.trim() : "";
    let tempPassword = ownerPassword;
    if (tempPassword) {
      if (tempPassword.length < 6)
        return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
    } else {
      tempPassword = crypto.randomBytes(4).toString("hex") + "A1";
    }

    staff.password = tempPassword;
    staff.status = "active";
    await staff.save();

    const loginUrl = `${process.env.FRONTEND_URL}/admin`;
    const emailResult = await sendEmail({
      to: staff.email,
      subject: "Your RestaurantOS password was reset",
      html: `
        <p>Hi ${staff.name},</p>
        <p>Your password was reset by your restaurant admin.</p>
        <p><strong>Login URL:</strong> <a href="${loginUrl}">${loginUrl}</a></p>
        <p><strong>Email:</strong> ${staff.email}</p>
        <p><strong>New Password:</strong> ${tempPassword}</p>
      `,
    });

    return res.status(200).json({
      success: true,
      tempPassword,
      emailSent: emailResult?.sent === true,
      loginUrl,
      credentials: {
        email: staff.email,
        password: tempPassword,
        loginUrl,
      },
      message: emailResult?.sent
        ? `New password emailed to ${staff.email}.`
        : `Password reset. Share the new password with ${staff.name}.`,
    });
  } catch (err) {
    console.error("resetStaffPassword error:", err);
    return res.status(500).json({ success: false, message: "Server error.", error: err.message });
  }
};

/**
 * PUT /api/admin/staff/:id
 */
export const updateStaff = async (req, res) => {
  try {
    const { password, status, role, ...updates } = req.body;

    const allowedStatus = ["active", "blocked", "inactive"];
    const patch = { ...updates };
    if (status && allowedStatus.includes(status)) patch.status = status;
    if (role && STAFF_ROLES.includes(role)) patch.role = role;

    if (patch.branchIds?.length) {
      patch.parentBranchId = patch.branchIds[0];
    }

    const staff = await StaffUser.findByIdAndUpdate(req.params.id, patch, { new: true, runValidators: true });
    if (!staff) return res.status(404).json({ success: false, message: "Staff not found." });
    return res.status(200).json({ success: true, data: staff, message: "Staff updated." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * PATCH /api/admin/staff/:id/permissions
 */
export const updatePermissions = async (req, res) => {
  try {
    const { permissions } = req.body;
    const staff = await StaffUser.findByIdAndUpdate(
      req.params.id,
      { permissions },
      { new: true }
    );
    if (!staff) return res.status(404).json({ success: false, message: "Staff not found." });
    return res.status(200).json({ success: true, data: staff, message: "Permissions updated." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * PATCH /api/admin/staff/:id/toggle-status
 */
export const toggleStaffStatus = async (req, res) => {
  try {
    const staff = await StaffUser.findById(req.params.id);
    if (!staff) return res.status(404).json({ success: false, message: "Staff not found." });

    staff.status = staff.status === "active" ? "blocked" : "active";
    await staff.save();
    return res.status(200).json({ success: true, data: staff, message: `Staff ${staff.status}.` });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * DELETE /api/admin/staff/:id
 */
export const deleteStaff = async (req, res) => {
  try {
    const staff = await StaffUser.findByIdAndDelete(req.params.id);
    if (!staff) return res.status(404).json({ success: false, message: "Staff not found." });
    return res.status(200).json({ success: true, message: "Staff removed." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
