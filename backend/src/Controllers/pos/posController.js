import Order      from "../../Models/Order.js";
import Branch     from "../../Models/Branch.js";
import Product    from "../../Models/Product.js";
import Notification from "../../Models/Notification.js";
import mongoose   from "mongoose";

/**
 * GET /api/admin/pos/transactions
 * All POS-sourced orders for a branch
 */
export const getPOSTransactions = async (req, res) => {
  try {
    const { branchId: tokenBid } = req.user;
    const branchId = req.query.branchId || tokenBid;
    const { page = 1, limit = 50, from, to } = req.query;

    const filter = { source: "pos" };
    if (branchId) filter.branchId = new mongoose.Types.ObjectId(branchId);
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to)   filter.createdAt.$lte = new Date(to);
    }

    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const total = await Order.countDocuments(filter);
    const txns  = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      data: txns,
      pagination: { total, page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * POST /api/admin/pos/sync
 * External POS system pushes a completed transaction here.
 * Body: { branchId, items, subtotal, tax, discount, total, paymentMethod, tableNo, customerName, customerPhone }
 */
export const syncPOSTransaction = async (req, res) => {
  try {
    const { branchId, items, subtotal, tax = 0, discount = 0, total,
            paymentMethod = "pos_cash", tableNo = null,
            customerName = "Walk-in Customer", customerPhone = "" } = req.body;

    if (!branchId || !items?.length)
      return res.status(400).json({ success: false, message: "branchId and items required." });

    // Verify branch exists
    const branch = await Branch.findById(branchId);
    if (!branch) return res.status(404).json({ success: false, message: "Branch not found." });

    const order = await Order.create({
      restaurantId:  branch.restaurantId,
      branchId:      branch._id,
      customerName,
      customerPhone,
      items:         items.map(i => ({
        productId: i.productId || "",
        name:      i.name,
        price:     i.price,
        qty:       i.qty || i.quantity || 1,
        total:     i.total || i.price * (i.qty || 1),
        image:     i.image || "",
      })),
      subtotal:      subtotal || items.reduce((s, i) => s + (i.total || 0), 0),
      tax,
      discount,
      total,
      deliveryFee:   0,
      status:        "delivered",
      confirmStatus: null,
      source:        "pos",
      type:          "dine-in",
      paymentMethod,
      tableNo,
      completedAt:   new Date(),
      posSync:       true,
    });

    // Bump branch stats
    await Branch.findByIdAndUpdate(branchId, {
      $inc: { totalRevenue: total, totalOrders: 1 },
      posLastSync: new Date(),
    });

    // Notification
    await Notification.create({
      branchId:     branch._id,
      restaurantId: branch.restaurantId,
      type:         "pos",
      title:        "POS Sale Synced",
      message:      `Table ${tableNo || "—"} · ${customerName} · PKR ${total.toLocaleString()}`,
      navTarget:    "pos",
    }).catch(() => {});

    return res.status(201).json({ success: true, data: order, message: "POS transaction synced." });
  } catch (err) {
    console.error("syncPOS:", err);
    return res.status(500).json({ success: false, message: "Server error.", error: err.message });
  }
};

/**
 * GET /api/admin/pos/status/:branchId
 * Check POS connection status for a branch
 */
export const getPOSStatus = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.branchId);
    if (!branch) return res.status(404).json({ success: false, message: "Branch not found." });

    return res.status(200).json({
      success:     true,
      data: {
        posEnabled:  branch.posEnabled,
        posSystem:   branch.posSystem,
        posLastSync: branch.posLastSync,
        status:      branch.posEnabled ? "connected" : "disconnected",
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * PATCH /api/admin/pos/settings/:branchId
 * Toggle POS on/off, change system name
 */
export const updatePOSSettings = async (req, res) => {
  try {
    const { posEnabled, posSystem } = req.body;
    const branch = await Branch.findByIdAndUpdate(
      req.params.branchId,
      {
        ...(posEnabled !== undefined ? { posEnabled } : {}),
        ...(posSystem   !== undefined ? { posSystem }   : {}),
      },
      { new: true }
    );
    if (!branch) return res.status(404).json({ success: false, message: "Branch not found." });
    return res.status(200).json({ success: true, data: branch, message: "POS settings updated." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
