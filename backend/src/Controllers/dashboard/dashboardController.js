import mongoose from "mongoose";
import Order from "../../Models/Order.js";
import Branch from "../../Models/Branch.js";
import Product from "../../Models/Product.js";
import Customer from "../../Models/Customer.js";

/**
 * GET /api/admin/dashboard/stats
 * Query: branchId (optional — if omitted, aggregates across all accessible branches)
 */
export const getDashboardStats = async (req, res) => {
  try {
    const { restaurantId, branchId: tokenBranchId, role } = req.user;
    const queryBranchId = req.query.branchId || tokenBranchId;

    // Build match filter
    const matchFilter = {};
    if (queryBranchId) {
      matchFilter.branchId = new mongoose.Types.ObjectId(queryBranchId);
    } else if (restaurantId) {
      matchFilter.restaurantId = new mongoose.Types.ObjectId(restaurantId);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const weekAgo  = new Date(Date.now() - 7  * 86400000);
    const monthAgo = new Date(Date.now() - 30 * 86400000);

    // Today orders
    const [
      todayStats,
      yesterdayStats,
      weekStats,
      prevWeekStats,
      pendingCount,
      activeOrderCount,
      totalCustomers,
    ] = await Promise.all([
      Order.aggregate([
        { $match: { ...matchFilter, createdAt: { $gte: today }, status: { $ne: "cancelled" } } },
        { $group: { _id: null, revenue: { $sum: "$total" }, orders: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $match: { ...matchFilter, createdAt: { $gte: yesterday, $lt: today }, status: { $ne: "cancelled" } } },
        { $group: { _id: null, revenue: { $sum: "$total" }, orders: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $match: { ...matchFilter, createdAt: { $gte: weekAgo }, status: { $ne: "cancelled" } } },
        { $group: { _id: null, revenue: { $sum: "$total" }, orders: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $match: { ...matchFilter, createdAt: { $gte: new Date(Date.now() - 14 * 86400000), $lt: weekAgo }, status: { $ne: "cancelled" } } },
        { $group: { _id: null, revenue: { $sum: "$total" } } },
      ]),
      Order.countDocuments({ ...matchFilter, status: "pending" }),
      Order.countDocuments({ ...matchFilter, status: { $in: ["pending","confirmed","preparing","ready"] } }),
      Customer.countDocuments(queryBranchId ? { parentBranchId: new mongoose.Types.ObjectId(queryBranchId) } : (restaurantId ? { restaurantId: new mongoose.Types.ObjectId(restaurantId) } : {})),
    ]);

    const todayRevenue    = todayStats[0]?.revenue    || 0;
    const todayOrders     = todayStats[0]?.orders     || 0;
    const yesterdayRev    = yesterdayStats[0]?.revenue || 0;
    const weekRevenue     = weekStats[0]?.revenue     || 0;
    const prevWeekRevenue = prevWeekStats[0]?.revenue || 0;

    const revenueGrowth = yesterdayRev > 0
      ? (((todayRevenue - yesterdayRev) / yesterdayRev) * 100).toFixed(1)
      : "0";
    const weekGrowth = prevWeekRevenue > 0
      ? (((weekRevenue - prevWeekRevenue) / prevWeekRevenue) * 100).toFixed(1)
      : "0";

    // COD pending confirmation
    const codPending = await Order.countDocuments({
      ...matchFilter,
      confirmStatus: "pending_call",
      status: { $ne: "cancelled" },
    });

    return res.status(200).json({
      success: true,
      data: {
        todayRevenue,
        todayOrders,
        weekRevenue,
        pendingOrders:  pendingCount,
        activeOrders:   activeOrderCount,
        codPending,
        totalCustomers,
        revenueGrowth:  Number(revenueGrowth),
        weekGrowth:     Number(weekGrowth),
      },
    });
  } catch (err) {
    console.error("getDashboardStats error:", err);
    return res.status(500).json({ success: false, message: "Server error.", error: err.message });
  }
};

/**
 * GET /api/admin/dashboard/revenue-chart
 * Query: branchId, days (default 30)
 */
export const getRevenueChart = async (req, res) => {
  try {
    const { restaurantId, branchId: tokenBranchId } = req.user;
    const queryBranchId = req.query.branchId || tokenBranchId;
    const days = parseInt(req.query.days) || 30;

    const matchFilter = {};
    if (queryBranchId) {
      matchFilter.branchId = new mongoose.Types.ObjectId(queryBranchId);
    } else if (restaurantId) {
      matchFilter.restaurantId = new mongoose.Types.ObjectId(restaurantId);
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days + 1);
    startDate.setHours(0, 0, 0, 0);

    const result = await Order.aggregate([
      {
        $match: {
          ...matchFilter,
          createdAt: { $gte: startDate },
          status: { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: {
            year:  { $year:  "$createdAt" },
            month: { $month: "$createdAt" },
            day:   { $dayOfMonth: "$createdAt" },
          },
          revenue:       { $sum: "$total" },
          orders:        { $sum: 1 },
          posRevenue:    { $sum: { $cond: [{ $eq: ["$source","pos"] }, "$total", 0] } },
          onlineRevenue: { $sum: { $cond: [{ $in: ["$source",["website","app","foodpanda","careem"]] }, "$total", 0] } },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    // Fill in missing days with 0
    const chart = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const found = result.find(r =>
        r._id.year === d.getFullYear() &&
        r._id.month === d.getMonth() + 1 &&
        r._id.day === d.getDate()
      );
      chart.push({
        date:          d.toLocaleDateString("en-US", { month:"short", day:"numeric" }),
        revenue:       found?.revenue       || 0,
        orders:        found?.orders        || 0,
        posRevenue:    found?.posRevenue    || 0,
        onlineRevenue: found?.onlineRevenue || 0,
      });
    }

    return res.status(200).json({ success: true, data: chart });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error.", error: err.message });
  }
};

/**
 * GET /api/admin/dashboard/top-selling
 * Query: branchId, limit (default 5)
 */
export const getTopSelling = async (req, res) => {
  try {
    const { restaurantId, branchId: tokenBranchId } = req.user;
    const queryBranchId = req.query.branchId || tokenBranchId;
    const limit = parseInt(req.query.limit) || 5;

    const matchFilter = { status: { $ne: "cancelled" } };
    if (queryBranchId) {
      matchFilter.branchId = new mongoose.Types.ObjectId(queryBranchId);
    } else if (restaurantId) {
      matchFilter.restaurantId = new mongoose.Types.ObjectId(restaurantId);
    }

    const monthAgo = new Date(Date.now() - 30 * 86400000);
    matchFilter.createdAt = { $gte: monthAgo };

    const result = await Order.aggregate([
      { $match: matchFilter },
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
      { $limit: limit },
    ]);

    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * GET /api/admin/dashboard/latest-orders
 */
export const getLatestOrders = async (req, res) => {
  try {
    const { restaurantId, branchId: tokenBranchId } = req.user;
    const queryBranchId = req.query.branchId || tokenBranchId;
    const limit = parseInt(req.query.limit) || 10;

    const filter = {};
    if (queryBranchId) filter.branchId = new mongoose.Types.ObjectId(queryBranchId);
    else if (restaurantId) filter.restaurantId = new mongoose.Types.ObjectId(restaurantId);

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("branchId", "name city");

    return res.status(200).json({ success: true, data: orders });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * GET /api/admin/dashboard/order-sources
 */
export const getOrderSources = async (req, res) => {
  try {
    const { restaurantId, branchId: tokenBranchId } = req.user;
    const queryBranchId = req.query.branchId || tokenBranchId;

    const matchFilter = { status: { $ne: "cancelled" } };
    if (queryBranchId) matchFilter.branchId = new mongoose.Types.ObjectId(queryBranchId);
    else if (restaurantId) matchFilter.restaurantId = new mongoose.Types.ObjectId(restaurantId);

    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
    matchFilter.createdAt = { $gte: thirtyDaysAgo };

    const result = await Order.aggregate([
      { $match: matchFilter },
      { $group: { _id: "$source", count: { $sum: 1 }, revenue: { $sum: "$total" } } },
      { $sort: { count: -1 } },
    ]);

    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
