import Order from "../../Models/Order.js";
import Branch from "../../Models/Branch.js";
import Product from "../../Models/Product.js";

const cleanNumber = (val) => {
  if (!val) return 0;
  if (typeof val === "number") return val;
  return Number(String(val).replace(/,/g, "")) || 0;
};

/**
 * POST /create
 * Used by the customer website checkout to place a new order.
 * Writes into the SAME Order collection the owner dashboard reads from.
 */
const createPublicOrder = async (req, res) => {
  try {
    const {
      customerName, phoneNumber, email, registeredFromWebsite,
      items, totalBill, deliveryFee, city, area,
      orderType, deliveryTime, paymentMethod, userId,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "Your cart is empty!" });
    }
    if (!customerName || !phoneNumber || !area) {
      return res.status(400).json({ success: false, message: "Required information is missing." });
    }

    const townFromArea = area.split("—")[0].trim();

    const branch = await Branch.findOne({
      city: { $regex: new RegExp(`^${city || ""}$`, "i") },
      areas: { $in: [townFromArea] },
    });

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: `No branch currently available for this area (${townFromArea}).`,
      });
    }

    const formattedItems = items.map((item) => ({
      productId: item._id || item.id || "",
      name: item.name || "Unknown Item",
      price: cleanNumber(item.price),
      qty: Number(item.quantity) || 1,
      total: cleanNumber(item.totalPrice),
      image: item.img || item.image || "",
      selectedSize: item.selectedSize || null,
      extras: item.extras || [],
      addons: item.addons || [],
      instructions: item.instructions || "",
    }));

    const typeMap = { "Pick-Up": "takeaway", Takeaway: "takeaway", Delivery: "delivery", Dining: "dine-in" };
    const paymentMap = { cod: "cod", card_on_delivery: "card", online_card: "online" };

    const subtotal = formattedItems.reduce((s, i) => s + i.total, 0);
    const fee = cleanNumber(deliveryFee);

    const newOrder = await Order.create({
      restaurantId: branch.restaurantId,
      branchId: branch._id,
      userId: userId || null,
      customerName,
      customerPhone: phoneNumber,
      customerAddress: area,
      city: city || "",
      area,
      items: formattedItems,
      subtotal,
      deliveryFee: fee,
      total: subtotal + fee,
      type: typeMap[orderType] || "delivery",
      paymentMethod: paymentMap[paymentMethod] || "cod",
      status: "pending",
      source: "website",
      deliveryTime: deliveryTime || "30-45 min",
      registeredFromWebsite: registeredFromWebsite || "",
    });

    // Update sold count for analytics (non-blocking)
    formattedItems.forEach((item) => {
      if (item.productId) {
        Product.findByIdAndUpdate(item.productId, { $inc: { sold: item.qty } }).catch(() => {});
      }
    });

    return res.status(201).json({
      success: true,
      message: "Order has been placed successfully! 🎉",
      order: newOrder,
    });
  } catch (error) {
    console.error("Order Save Error:", error);
    return res.status(500).json({ success: false, message: "Server error: order could not be saved.", error: error.message });
  }
};

export default createPublicOrder;
