import mongoose from "mongoose";
import Order     from "../../Models/Order.js";
import Product   from "../../Models/Product.js";
import Branch    from "../../Models/Branch.js";
import Customer  from "../../Models/Customer.js";

const buildMatch = (user, query = {}) => {
  const m = {};
  const bid = query.branchId || user.branchId;
  if (bid) m.branchId = new mongoose.Types.ObjectId(bid);
  else if (user.restaurantId) m.restaurantId = new mongoose.Types.ObjectId(user.restaurantId);
  return m;
};

/**
 * GET /api/admin/reports/daily
 * Full daily breakdown: orders, revenue, items sold, by-source
 */
export const getDailyReport = async (req, res) => {
  try {
    const { date, branchId } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const matchBase = {
      ...buildMatch(req.user, req.query),
      createdAt: { $gte: targetDate, $lt: nextDay },
    };

    const [
      orders,
      byStatus,
      bySource,
      byPayment,
      byType,
      topItems,
    ] = await Promise.all([
      Order.aggregate([
        { $match: matchBase },
        {
          $group: {
            _id:        null,
            totalOrders:   { $sum: 1 },
            totalRevenue:  { $sum: { $cond: [{ $ne: ["$status","cancelled"] }, "$total", 0] } },
            totalTax:      { $sum: { $cond: [{ $ne: ["$status","cancelled"] }, "$tax", 0] } },
            totalDiscount: { $sum: { $cond: [{ $ne: ["$status","cancelled"] }, "$discount", 0] } },
            avgOrderValue: { $avg: { $cond: [{ $ne: ["$status","cancelled"] }, "$total", null] } },
            cancelled:     { $sum: { $cond: [{ $eq: ["$status","cancelled"] }, 1, 0] } },
            delivered:     { $sum: { $cond: [{ $eq: ["$status","delivered"] }, 1, 0] } },
          },
        },
      ]),

      Order.aggregate([
        { $match: matchBase },
        { $group: { _id: "$status", count: { $sum: 1 }, revenue: { $sum: "$total" } } },
      ]),

      Order.aggregate([
        { $match: matchBase },
        { $group: { _id: "$source", count: { $sum: 1 }, revenue: { $sum: "$total" } } },
        { $sort: { count: -1 } },
      ]),

      Order.aggregate([
        { $match: matchBase },
        { $group: { _id: "$paymentMethod", count: { $sum: 1 }, revenue: { $sum: "$total" } } },
        { $sort: { count: -1 } },
      ]),

      Order.aggregate([
        { $match: matchBase },
        { $group: { _id: "$type", count: { $sum: 1 }, revenue: { $sum: "$total" } } },
      ]),

      Order.aggregate([
        { $match: { ...matchBase, status: { $ne: "cancelled" } } },
        { $unwind: "$items" },
        {
          $group: {
            _id:     "$items.productId",
            name:    { $first: "$items.name" },
            sold:    { $sum: "$items.qty" },
            revenue: { $sum: "$items.total" },
          },
        },
        { $sort: { sold: -1 } },
        { $limit: 10 },
      ]),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        date:       targetDate.toISOString().split("T")[0],
        summary:    orders[0] || { totalOrders: 0, totalRevenue: 0 },
        byStatus,
        bySource,
        byPayment,
        byType,
        topItems,
      },
    });
  } catch (err) {
    console.error("getDailyReport:", err);
    return res.status(500).json({ success: false, message: "Server error.", error: err.message });
  }
};

/**
 * GET /api/admin/reports/monthly
 * Month-over-month revenue + orders
 */
export const getMonthlyReport = async (req, res) => {
  try {
    const { months = 6, branchId } = req.query;
    const matchBase = buildMatch(req.user, req.query);
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months) + 1);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);
    matchBase.createdAt = { $gte: startDate };
    matchBase.status    = { $ne: "cancelled" };

    const result = await Order.aggregate([
      { $match: matchBase },
      {
        $group: {
          _id: {
            year:  { $year:  "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue:     { $sum: "$total" },
          orders:      { $sum: 1 },
          avgOrder:    { $avg: "$total" },
          posRevenue:  { $sum: { $cond: [{ $eq: ["$source","pos"] }, "$total", 0] } },
          webRevenue:  { $sum: { $cond: [{ $in: ["$source",["website","app"]] }, "$total", 0] } },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const report = result.map(r => ({
      label:      `${monthNames[r._id.month - 1]} ${r._id.year}`,
      revenue:    r.revenue,
      orders:     r.orders,
      avgOrder:   Math.round(r.avgOrder || 0),
      posRevenue: r.posRevenue,
      webRevenue: r.webRevenue,
    }));

    return res.status(200).json({ success: true, data: report });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * GET /api/admin/reports/customers
 * Top customers + new vs returning
 */
export const getCustomerReport = async (req, res) => {
  try {
    const { branchId, days = 30 } = req.query;
    const matchBase = {
      ...buildMatch(req.user, req.query),
      createdAt: { $gte: new Date(Date.now() - parseInt(days) * 86400000) },
      status:    { $ne: "cancelled" },
    };

    const topCustomers = await Order.aggregate([
      { $match: matchBase },
      {
        $group: {
          _id:         "$customerPhone",
          name:        { $last: "$customerName" },
          orders:      { $sum: 1 },
          totalSpent:  { $sum: "$total" },
          lastOrder:   { $max: "$createdAt" },
        },
      },
      { $sort: { orders: -1 } },
      { $limit: 20 },
    ]);

    const totalCustomers = await Customer.countDocuments(
      branchId ? { parentBranchId: new mongoose.Types.ObjectId(branchId) } :
      req.user.restaurantId ? { restaurantId: new mongoose.Types.ObjectId(req.user.restaurantId) } : {}
    );

    return res.status(200).json({
      success: true,
      data: { topCustomers, totalCustomers },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
