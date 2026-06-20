import mongoose from "mongoose";
import Order from "../../Models/Order.js";
import Notification from "../../Models/Notification.js";

// ─── Helper ───────────────────────────────────────────────────────────────────
const buildBranchFilter = (user, queryBranchId) => {
  const filter = {};
  const bid = queryBranchId || user.branchId;
  if (bid) filter.branchId = new mongoose.Types.ObjectId(bid);
  else if (user.restaurantId) filter.restaurantId = new mongoose.Types.ObjectId(user.restaurantId);
  return filter;
};

/**
 * GET /api/admin/orders
 * Query: branchId, status, source, type, page, limit, search, from, to
 */
export const getOrders = async (req, res) => {
  try {
    const { status, source, type, page = 1, limit = 50, search, from, to, branchId } = req.query;
    const filter = buildBranchFilter(req.user, branchId);

    if (status)  filter.status  = status;
    if (source)  filter.source  = source;
    if (type)    filter.type    = type;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to)   filter.createdAt.$lte = new Date(to);
    }
    if (search) {
      const re = new RegExp(search, "i");
      filter.$or = [{ customerName: re }, { customerPhone: re }];
    }

    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("branchId", "name city");

    return res.status(200).json({
      success: true,
      data: orders,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error.", error: err.message });
  }
};

/**
 * GET /api/admin/orders/:id
 */
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("branchId", "name city");
    if (!order) return res.status(404).json({ success: false, message: "Order not found." });
    return res.status(200).json({ success: true, data: order });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * PATCH /api/admin/orders/:id/status
 * Body: { status }
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending","confirmed","preparing","ready","delivered","cancelled"];
    if (!validStatuses.includes(status))
      return res.status(400).json({ success: false, message: "Invalid status." });

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status,
        ...(status === "delivered" ? { completedAt: new Date() } : {}),
      },
      { new: true }
    );
    if (!order) return res.status(404).json({ success: false, message: "Order not found." });

    return res.status(200).json({ success: true, data: order, message: `Order ${status}.` });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * PATCH /api/admin/orders/:id/accept
 */
export const acceptOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: "confirmed", confirmStatus: "confirmed" },
      { new: true }
    );
    if (!order) return res.status(404).json({ success: false, message: "Order not found." });

    // Create notification
    await Notification.create({
      branchId:   order.branchId,
      restaurantId: order.restaurantId,
      type:       "order",
      title:      "Order Accepted",
      message:    `Order from ${order.customerName} confirmed.`,
      navTarget:  "orders",
      navParam:   order._id.toString(),
    });

    return res.status(200).json({ success: true, data: order });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * PATCH /api/admin/orders/:id/reject
 * Body: { reason }
 */
export const rejectOrder = async (req, res) => {
  try {
    const { reason = "" } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: "cancelled", confirmStatus: "rejected", rejectionReason: reason },
      { new: true }
    );
    if (!order) return res.status(404).json({ success: false, message: "Order not found." });
    return res.status(200).json({ success: true, data: order });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * PATCH /api/admin/orders/:id/call-attempt
 */
export const logCallAttempt = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { $inc: { callAttempts: 1 }, confirmStatus: "call_done" },
      { new: true }
    );
    if (!order) return res.status(404).json({ success: false, message: "Order not found." });
    return res.status(200).json({ success: true, data: order });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * GET /api/admin/orders/counter/pending
 * COD orders needing call confirmation
 */
export const getCounterPending = async (req, res) => {
  try {
    const filter = buildBranchFilter(req.user, req.query.branchId);
    filter.confirmStatus = { $in: ["pending_call","call_done","no_answer"] };
    filter.status = { $ne: "cancelled" };

    const orders = await Order.find(filter).sort({ createdAt: -1 }).populate("branchId", "name");
    return res.status(200).json({ success: true, data: orders });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * GET /api/admin/orders/kitchen
 * Orders for kitchen display
 */
export const getKitchenOrders = async (req, res) => {
  try {
    const filter = buildBranchFilter(req.user, req.query.branchId);
    filter.status = { $in: ["confirmed","preparing","ready"] };

    const orders = await Order.find(filter).sort({ createdAt: 1 });
    return res.status(200).json({ success: true, data: orders });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * POST /api/admin/orders  (counter / manual order creation)
 */
export const createOrder = async (req, res) => {
  try {
    const { restaurantId, branchId } = req.user;
    const body = req.body;

    const subtotal  = body.items.reduce((s, i) => s + i.total, 0);
    const taxAmt    = Math.round(subtotal * ((body.taxRate || 16) / 100));
    const total     = subtotal + taxAmt - (body.discount || 0) + (body.deliveryFee || 0);

    const order = await Order.create({
      restaurantId: restaurantId || body.restaurantId,
      branchId:     branchId     || body.branchId,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      customerAddress: body.customerAddress || "",
      city:   body.city  || "",
      area:   body.area  || "",
      items:  body.items,
      subtotal,
      tax:    taxAmt,
      discount:    body.discount    || 0,
      deliveryFee: body.deliveryFee || 0,
      total,
      status:        "pending",
      confirmStatus: null,
      source:        body.source        || "counter",
      type:          body.type          || "dine-in",
      paymentMethod: body.paymentMethod || "cod",
      tableNo:       body.tableNo       || null,
      note:          body.note          || "",
      deliveryTime:  body.deliveryTime  || "30-45 min",
    });

    return res.status(201).json({ success: true, data: order, message: "Order created." });
  } catch (err) {
    console.error("createOrder error:", err);
    return res.status(500).json({ success: false, message: "Server error.", error: err.message });
  }
};

/**
 * GET /api/admin/orders/history
 * Query: branchId, from, to, page, limit
 */
export const getOrderHistory = async (req, res) => {
  try {
    const { branchId, from, to, page = 1, limit = 50 } = req.query;
    const filter = buildBranchFilter(req.user, branchId);
    filter.status = { $in: ["delivered","cancelled"] };

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to)   filter.createdAt.$lte = new Date(to);
    }

    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      data: orders,
      pagination: { total, page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
