import mongoose from "mongoose";
import Product from "../../Models/Product.js";
import Category from "../../Models/Category.js";
import Branch from "../../Models/Branch.js";

// Helper: get branchId from token or query
const getCtx = (user, query = {}) => ({
  restaurantId: user.restaurantId || query.restaurantId,
  branchId:     user.branchId     || query.branchId,
});

/**
 * GET /api/admin/products
 * Query: branchId, categoryId, active, featured, search
 * Returns products for the active branch PLUS any "all branches" products
 * (branchId: null) for the same restaurant.
 */
export const getProducts = async (req, res) => {
  try {
    const { categoryId, active, featured, search } = req.query;
    const ctx = getCtx(req.user, req.query);

    const filter = {};
    if (ctx.branchId && ctx.restaurantId) {
      filter.restaurantId = ctx.restaurantId;
      filter.$or = [{ branchId: ctx.branchId }, { branchId: null }];
    } else if (ctx.branchId) {
      filter.$or = [{ branchId: ctx.branchId }, { branchId: null }];
    } else if (ctx.restaurantId) {
      filter.restaurantId = ctx.restaurantId;
    }

    if (categoryId)     filter.categoryId   = categoryId;
    if (active !== undefined) filter.active = active === "true";
    if (featured !== undefined) filter.featured = featured === "true";
    if (search) filter.name = new RegExp(search, "i");

    const products = await Product.find(filter)
      .populate("categoryId", "name color icon")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: products });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error.", error: err.message });
  }
};

/**
 * GET /api/admin/products/:id
 */
export const getProductById = async (req, res) => {
  try {
    const p = await Product.findById(req.params.id).populate("categoryId", "name color icon");
    if (!p) return res.status(404).json({ success: false, message: "Product not found." });
    return res.status(200).json({ success: true, data: p });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * POST /api/admin/products
 * Body may include `applyToAllBranches: true` to make this product visible
 * on every branch of the restaurant (stored as branchId: null).
 */
export const createProduct = async (req, res) => {
  try {
    const ctx = getCtx(req.user, req.body);
    if (!ctx.restaurantId)
      return res.status(400).json({ success: false, message: "restaurantId required." });

    const { applyToAllBranches, ...rest } = req.body;
    const branchId = applyToAllBranches ? null : ctx.branchId;

    if (!applyToAllBranches && !branchId)
      return res.status(400).json({ success: false, message: "branchId required (or set applyToAllBranches)." });

    // Validate category: must belong to this branch, OR be an "all branches" category
    const cat = await Category.findOne({
      _id: req.body.categoryId,
      restaurantId: ctx.restaurantId,
      $or: [{ branchId: branchId }, { branchId: null }],
    });
    if (!cat) return res.status(400).json({ success: false, message: "Category not found for this branch scope." });

    const product = await Product.create({
      ...rest,
      branchId,
      restaurantId: ctx.restaurantId,
    });

    return res.status(201).json({ success: true, data: product, message: "Product created." });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ success: false, message: "Duplicate SKU." });
    return res.status(500).json({ success: false, message: "Server error.", error: err.message });
  }
};

/**
 * PUT /api/admin/products/:id
 * Accepts `applyToAllBranches` the same way createProduct does.
 */
export const updateProduct = async (req, res) => {
  try {
    const { applyToAllBranches, ...rest } = req.body;
    const updates = { ...rest };
    if (applyToAllBranches !== undefined) {
      updates.branchId = applyToAllBranches ? null : (req.body.branchId || req.user.branchId || null);
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });
    return res.status(200).json({ success: true, data: product, message: "Product updated." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error.", error: err.message });
  }
};

/**
 * DELETE /api/admin/products/:id
 */
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });
    return res.status(200).json({ success: true, message: "Product deleted." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * PATCH /api/admin/products/:id/toggle
 */
export const toggleProductStatus = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });
    product.active = !product.active;
    await product.save();
    return res.status(200).json({ success: true, data: product, message: `Product ${product.active ? "enabled" : "disabled"}.` });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * GET /api/menu  — public endpoint for customer website (branchId-only variant)
 * Query: branchId (required)
 * Includes "all branches" products/categories (branchId: null) for the
 * same restaurant as the given branch.
 */
export const getPublicMenu = async (req, res) => {
  try {
    const { branchId } = req.query;
    if (!branchId) return res.status(400).json({ success: false, message: "branchId required." });
    if (!mongoose.Types.ObjectId.isValid(branchId))
      return res.status(400).json({ success: false, message: "Invalid branchId." });

    const branchDoc = await Branch.findById(branchId).select("restaurantId");
    const restaurantId = branchDoc?.restaurantId;

    const scopeFilter = restaurantId
      ? { restaurantId, $or: [{ branchId }, { branchId: null }] }
      : { $or: [{ branchId }, { branchId: null }] };

    const categories = await Category.find({ ...scopeFilter, active: true }).sort({ sortOrder: 1 });
    const products   = await Product.find({ ...scopeFilter, active: true }).sort({ sortOrder: 1, createdAt: -1 });

    const menu = categories.map(cat => ({
      ...cat.toJSON(),
      items: products.filter(p => p.categoryId.toString() === cat._id.toString()),
    }));

    return res.status(200).json({ success: true, data: menu });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error.", error: err.message });
  }
};
