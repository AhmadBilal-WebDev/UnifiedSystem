import mongoose from "mongoose";
import Order from "../../Models/Order.js";
import Product from "../../Models/Product.js";
import Branch from "../../Models/Branch.js";
import Customer from "../../Models/Customer.js";

const buildMatch = (user, query = {}) => {
  const m = {};
  const bid = query.branchId || user.branchId;
  if (bid) m.branchId = new mongoose.Types.ObjectId(bid);
  else if (user.restaurantId) m.restaurantId = new mongoose.Types.ObjectId(user.restaurantId);
  m.status = { $ne: "cancelled" };
  return m;
};

/**
 * GET /api/admin/analytics/summary
 * Comprehensive stats for the Analytics page
 */
export const getAnalyticsSummary = async (req, res) => {
  try {
    const { days = 30, branchId } = req.query;
    const startDate = new Date(Date.now() - parseInt(days) * 86400000);
    const matchBase = { ...buildMatch(req.user, req.query), createdAt: { $gte: startDate } };

    const [
      revenueBySource,
      revenueByType,
      revenueByPayment,
      topProducts,
      hourlyDistribution,
      ratingDistribution,
    ] = await Promise.all([
      // Revenue by source
      Order.aggregate([
        { $match: matchBase },
        { $group: { _id: "$source", count: { $sum: 1 }, revenue: { $sum: "$total" } } },
      ]),

      // Revenue by order type
      Order.aggregate([
        { $match: matchBase },
        { $group: { _id: "$type", count: { $sum: 1 }, revenue: { $sum: "$total" } } },
      ]),

      // Revenue by payment method
      Order.aggregate([
        { $match: matchBase },
        { $group: { _id: "$paymentMethod", count: { $sum: 1 }, revenue: { $sum: "$total" } } },
      ]),

      // Top 10 selling products
      Order.aggregate([
        { $match: matchBase },
        { $unwind: "$items" },
        { $group: { _id: "$items.productId", name: { $first: "$items.name" }, sold: { $sum: "$items.qty" }, revenue: { $sum: "$items.total" } } },
        { $sort: { sold: -1 } },
        { $limit: 10 },
      ]),

      // Orders by hour of day
      Order.aggregate([
        { $match: matchBase },
        { $group: { _id: { $hour: "$createdAt" }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),

      // Rating distribution
      Order.aggregate([
        { $match: { ...matchBase, rating: { $ne: null } } },
        { $group: { _id: "$rating", count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        revenueBySource,
        revenueByType,
        revenueByPayment,
        topProducts,
        hourlyDistribution,
        ratingDistribution,
      },
    });
  } catch (err) {
    console.error("getAnalyticsSummary error:", err);
    return res.status(500).json({ success: false, message: "Server error.", error: err.message });
  }
};

/**
 * GET /api/admin/analytics/reports
 * Revenue report: daily / weekly / monthly
 */
export const getRevenueReport = async (req, res) => {
  try {
    const { period = "daily", branchId, from, to } = req.query;
    const matchBase = buildMatch(req.user, req.query);

    if (from || to) {
      matchBase.createdAt = {};
      if (from) matchBase.createdAt.$gte = new Date(from);
      if (to)   matchBase.createdAt.$lte = new Date(to);
    } else {
      matchBase.createdAt = { $gte: new Date(Date.now() - 30 * 86400000) };
    }

    let groupId;
    if (period === "monthly") {
      groupId = { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } };
    } else if (period === "weekly") {
      groupId = { year: { $year: "$createdAt" }, week: { $week: "$createdAt" } };
    } else {
      groupId = { year: { $year: "$createdAt" }, month: { $month: "$createdAt" }, day: { $dayOfMonth: "$createdAt" } };
    }

    const result = await Order.aggregate([
      { $match: matchBase },
      {
        $group: {
          _id:       groupId,
          revenue:   { $sum: "$total" },
          orders:    { $sum: 1 },
          avgOrder:  { $avg: "$total" },
          cancelled: { $sum: { $cond: [{ $eq: ["$status","cancelled"] }, 1, 0] } },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
