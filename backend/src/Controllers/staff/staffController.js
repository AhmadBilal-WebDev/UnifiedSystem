import StaffUser from "../../Models/StaffUser.js";
import { sendEmail } from "../../Services/emailService.js";
import crypto from "crypto";

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
    const { name, email, role, branchIds, permissions, phone } = req.body;

    if (!name || !email || !role)
      return res.status(400).json({ success: false, message: "name, email, role required." });

    const existing = await StaffUser.findOne({ email: email.toLowerCase() });
    if (existing)
      return res.status(409).json({ success: false, message: "An account with this email already exists." });

    // Generate a temporary password
    const tempPassword = crypto.randomBytes(6).toString("hex");

    const resolvedPermissions =
      permissions?.length > 0
        ? permissions
        : ROLE_DEFAULT_PERMISSIONS[role] || [];

    const staff = await StaffUser.create({
      name,
      email: email.toLowerCase(),
      password: tempPassword,
      role,
      accountType: "staff",
      restaurantId: restaurantId || req.body.restaurantId,
      branchIds: branchIds || (branchId ? [branchId] : []),
      parentBranchId: branchId || null,
      permissions: resolvedPermissions,
      phone: phone || "",
      color: req.body.color || "#6366f1",
    });

    // Send invite email
    await sendEmail({
      to: email,
      subject: "You've been invited to RestaurantOS",
      html: `
        <p>Hi ${name},</p>
        <p>You have been added to the RestaurantOS platform as <strong>${role}</strong>.</p>
        <p><strong>Login Email:</strong> ${email}</p>
        <p><strong>Temporary Password:</strong> ${tempPassword}</p>
        <p>Please login and change your password immediately.</p>
        <a href="${process.env.FRONTEND_URL}/admin/login" style="background:#f97316;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;">Login Now</a>
      `,
    }).catch(e => console.warn("Email send warning:", e.message));

    return res.status(201).json({
      success: true,
      data: staff,
      message: `Staff member invited. Temporary password sent to ${email}.`,
    });
  } catch (err) {
    console.error("createStaff error:", err);
    return res.status(500).json({ success: false, message: "Server error.", error: err.message });
  }
};

/**
 * PUT /api/admin/staff/:id
 */
export const updateStaff = async (req, res) => {
  try {
    // Don't allow password change through this route
    const { password, ...updates } = req.body;
    const staff = await StaffUser.findByIdAndUpdate(req.params.id, updates, { new: true });
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
