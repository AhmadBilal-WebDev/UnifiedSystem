import Restaurant from "../../Models/Restaurant.js";
import StaffUser   from "../../Models/StaffUser.js";
import Branch      from "../../Models/Branch.js";
import Order       from "../../Models/Order.js";
import mongoose    from "mongoose";

/**
 * GET /api/admin/clients
 * Superadmin: list all restaurants/clients
 */
export const getClients = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      const re = new RegExp(search, "i");
      filter.$or = [{ name: re }, { ownerEmail: re }, { ownerName: re }];
    }

    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const total = await Restaurant.countDocuments(filter);
    const restaurants = await Restaurant.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Enrich with branch + order counts
    const enriched = await Promise.all(
      restaurants.map(async (r) => {
        const [branches, totalOrders, monthlyRevenue] = await Promise.all([
          Branch.countDocuments({ restaurantId: r._id }),
          Order.countDocuments({ restaurantId: r._id }),
          Order.aggregate([
            {
              $match: {
                restaurantId: r._id,
                status: { $ne: "cancelled" },
                createdAt: { $gte: new Date(Date.now() - 30 * 86400000) },
              },
            },
            { $group: { _id: null, rev: { $sum: "$total" } } },
          ]),
        ]);
        return {
          ...r.toJSON(),
          id:             r._id,
          branches,
          totalOrders,
          monthlyRevenue: monthlyRevenue[0]?.rev || 0,
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: enriched,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("getClients:", err);
    return res.status(500).json({ success: false, message: "Server error.", error: err.message });
  }
};

/**
 * GET /api/admin/clients/:id
 */
export const getClientById = async (req, res) => {
  try {
    const r = await Restaurant.findById(req.params.id);
    if (!r) return res.status(404).json({ success: false, message: "Restaurant not found." });

    const [branches, adminUser] = await Promise.all([
      Branch.find({ restaurantId: r._id }),
      StaffUser.findOne({ restaurantId: r._id, role: "client_admin" }),
    ]);

    return res.status(200).json({
      success: true,
      data: { ...r.toJSON(), id: r._id, branches, adminUser },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * POST /api/admin/clients
 * Create a new restaurant + its client_admin user in one step
 */
export const createClient = async (req, res) => {
  try {
    const {
      name, ownerName, ownerEmail, contactNumber,
      plan, cuisine, posSystem, color,
      adminPassword = "Admin@123",
      settings,
    } = req.body;

    if (!name || !ownerName || !ownerEmail)
      return res.status(400).json({ success: false, message: "name, ownerName, ownerEmail required." });

    // Check duplicate
    const exists = await Restaurant.findOne({ ownerEmail: ownerEmail.toLowerCase() });
    if (exists)
      return res.status(409).json({ success: false, message: "A restaurant with this email already exists." });

    // Create restaurant
    const restaurant = await Restaurant.create({
      name, ownerName, ownerEmail: ownerEmail.toLowerCase(),
      contactNumber: contactNumber || "",
      plan: plan || "Pro",
      cuisine: cuisine || "Fast Food",
      posSystem: posSystem || "None",
      color: color || "#f97316",
      settings: settings || {},
    });

    // Create client_admin user
    const adminUser = await StaffUser.create({
      name:         ownerName,
      email:        ownerEmail.toLowerCase(),
      password:     adminPassword,
      role:         "client_admin",
      accountType:  "client_admin",
      restaurantId: restaurant._id,
      avatar:       ownerName.slice(0, 2).toUpperCase(),
      color:        color || "#f97316",
      status:       "active",
    });

    return res.status(201).json({
      success: true,
      data: { restaurant: { ...restaurant.toJSON(), id: restaurant._id }, adminUser },
      message: `Restaurant "${name}" created. Login: ${ownerEmail} / ${adminPassword}`,
    });
  } catch (err) {
    console.error("createClient:", err);
    return res.status(500).json({ success: false, message: "Server error.", error: err.message });
  }
};

/**
 * PUT /api/admin/clients/:id
 */
export const updateClient = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!restaurant) return res.status(404).json({ success: false, message: "Restaurant not found." });
    return res.status(200).json({ success: true, data: { ...restaurant.toJSON(), id: restaurant._id }, message: "Updated." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * PATCH /api/admin/clients/:id/status
 * Body: { status: "active" | "blocked" | "suspended" }
 */
export const updateClientStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["active", "blocked", "suspended"];
    if (!allowed.includes(status))
      return res.status(400).json({ success: false, message: "Invalid status." });

    const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!restaurant) return res.status(404).json({ success: false, message: "Restaurant not found." });

    // Also update all staff under this restaurant
    await StaffUser.updateMany(
      { restaurantId: restaurant._id, role: { $ne: "superadmin" } },
      { status: status === "active" ? "active" : "blocked" }
    );

    return res.status(200).json({
      success: true,
      data: { ...restaurant.toJSON(), id: restaurant._id },
      message: `Restaurant ${status}.`,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * DELETE /api/admin/clients/:id
 */
export const deleteClient = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndDelete(req.params.id);
    if (!restaurant) return res.status(404).json({ success: false, message: "Restaurant not found." });

    // Cascade delete staff (branches & orders kept for records)
    await StaffUser.deleteMany({ restaurantId: req.params.id });

    return res.status(200).json({ success: true, message: "Restaurant and staff deleted." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * GET /api/admin/clients/stats/overview
 * Superadmin dashboard stats across ALL restaurants
 */
export const getSuperAdminStats = async (req, res) => {
  try {
    const today    = new Date(); today.setHours(0, 0, 0, 0);
    const monthAgo = new Date(Date.now() - 30 * 86400000);

    const [
      totalRestaurants,
      activeRestaurants,
      totalBranches,
      totalOrdersToday,
      monthlyRevenue,
      revenueByRestaurant,
    ] = await Promise.all([
      Restaurant.countDocuments({}),
      Restaurant.countDocuments({ status: "active" }),
      Branch.countDocuments({}),
      Order.countDocuments({ createdAt: { $gte: today }, status: { $ne: "cancelled" } }),
      Order.aggregate([
        { $match: { createdAt: { $gte: monthAgo }, status: { $ne: "cancelled" } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: monthAgo }, status: { $ne: "cancelled" } } },
        { $group: { _id: "$restaurantId", revenue: { $sum: "$total" }, orders: { $sum: 1 } } },
        { $sort: { revenue: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "restaurants",
            localField: "_id",
            foreignField: "_id",
            as: "restaurant",
          },
        },
        { $unwind: { path: "$restaurant", preserveNullAndEmptyArrays: true } },
        { $project: { name: "$restaurant.name", revenue: 1, orders: 1 } },
      ]),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalRestaurants,
        activeRestaurants,
        totalBranches,
        totalOrdersToday,
        monthlyRevenue: monthlyRevenue[0]?.total || 0,
        topRestaurants:  revenueByRestaurant,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error.", error: err.message });
  }
};
