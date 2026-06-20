import Order from "../../Models/Order.js";

/** GET /myorders — logged in customer's order history */
export const getMyOrders = async (req, res) => {
  try {
    const customerId = req.customer.id || req.customer._id;
    const orders = await Order.find({
      $or: [{ userId: customerId }, { customerPhone: req.customer.phone }],
    }).sort({ createdAt: -1 });
    return res.status(200).json({ orders });
  } catch (error) {
    return res.status(500).json({ message: "Server error." });
  }
};

/** DELETE /myorders/clear-all */
export const clearAllOrders = async (req, res) => {
  try {
    const customerId = req.customer.id || req.customer._id;
    await Order.deleteMany({ userId: customerId, status: { $in: ["delivered", "cancelled"] } });
    return res.status(200).json({ message: "Order history cleared." });
  } catch (error) {
    return res.status(500).json({ message: "Server error." });
  }
};

/** GET /:id — single order detail */
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found." });
    return res.status(200).json({ order });
  } catch (error) {
    return res.status(500).json({ message: "Server error." });
  }
};

/** DELETE /:id — cancel order (only if still pending) */
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found." });
    if (!["pending", "confirmed"].includes(order.status)) {
      return res.status(400).json({ message: "This order can no longer be cancelled." });
    }
    order.status = "cancelled";
    await order.save();
    return res.status(200).json({ message: "Order cancelled.", order });
  } catch (error) {
    return res.status(500).json({ message: "Server error." });
  }
};
