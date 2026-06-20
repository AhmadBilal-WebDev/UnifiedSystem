import Inventory from "../../Models/Inventory.js";
import Notification from "../../Models/Notification.js";

const getCtx = (user) => ({
  restaurantId: user.restaurantId,
  branchId:     user.branchId,
});

/** GET /api/admin/inventory */
export const getInventory = async (req, res) => {
  try {
    const ctx = getCtx(req.user);
    const filter = {};
    if (ctx.branchId) filter.branchId = ctx.branchId;
    else if (ctx.restaurantId) filter.restaurantId = ctx.restaurantId;
    if (req.query.branchId) filter.branchId = req.query.branchId;
    if (req.query.category) filter.category = req.query.category;

    const items = await Inventory.find(filter).sort({ category: 1, name: 1 });
    return res.status(200).json({ success: true, data: items });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/** POST /api/admin/inventory */
export const createInventoryItem = async (req, res) => {
  try {
    const ctx = getCtx(req.user);
    const item = await Inventory.create({
      ...req.body,
      branchId:     ctx.branchId     || req.body.branchId,
      restaurantId: ctx.restaurantId || req.body.restaurantId,
    });
    return res.status(201).json({ success: true, data: item, message: "Item added." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error.", error: err.message });
  }
};

/** PUT /api/admin/inventory/:id */
export const updateInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ success: false, message: "Item not found." });

    // Check if item is now low/critical and send notification
    if (item.quantity <= item.reorderPoint) {
      await Notification.create({
        branchId:     item.branchId,
        restaurantId: item.restaurantId,
        type:         "alert",
        title:        `Low Stock: ${item.name}`,
        message:      `${item.name} is ${item.quantity <= 0 ? "out of stock" : "running low"} at ${item.quantity} ${item.unit}`,
        priority:     item.quantity <= 0 ? "high" : "normal",
        navTarget:    "inventory",
      }).catch(() => {});
    }

    return res.status(200).json({ success: true, data: item, message: "Updated." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/** PATCH /api/admin/inventory/:id/restock */
export const restockItem = async (req, res) => {
  try {
    const { qty } = req.body;
    if (!qty || qty <= 0)
      return res.status(400).json({ success: false, message: "qty must be positive." });

    const item = await Inventory.findByIdAndUpdate(
      req.params.id,
      { $inc: { quantity: qty }, lastRestocked: new Date() },
      { new: true }
    );
    if (!item) return res.status(404).json({ success: false, message: "Item not found." });
    return res.status(200).json({ success: true, data: item, message: `Restocked +${qty} ${item.unit}.` });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/** DELETE /api/admin/inventory/:id */
export const deleteInventoryItem = async (req, res) => {
  try {
    await Inventory.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: "Item deleted." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
