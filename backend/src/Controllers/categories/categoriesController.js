import Category from "../../Models/Category.js";
import Product from "../../Models/Product.js";

const getCtx = (user, body = {}) => ({
  restaurantId: user.restaurantId || body.restaurantId,
  branchId:     body.branchId || user.branchId,
});

/**
 * GET /api/admin/categories
 * Returns categories for the active branch PLUS any "all branches" categories
 * (branchId: null) for the same restaurant, so the dashboard list and the
 * customer-facing menu both see the full effective set.
 */
export const getCategories = async (req, res) => {
  try {
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

    const cats = await Category.find(filter).sort({ sortOrder: 1, name: 1 });
    return res.status(200).json({ success: true, data: cats });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/**
 * POST /api/admin/categories
 * Body may include `applyToAllBranches: true` to make this category visible
 * on every branch of the restaurant (stored as branchId: null).
 */
export const createCategory = async (req, res) => {
  try {
    const ctx = getCtx(req.user, req.body);
    if (!ctx.restaurantId)
      return res.status(400).json({ success: false, message: "restaurantId required." });

    const { applyToAllBranches, ...rest } = req.body;
    const branchId = applyToAllBranches ? null : ctx.branchId;

    if (!applyToAllBranches && !branchId)
      return res.status(400).json({ success: false, message: "branchId required (or set applyToAllBranches)." });

    const cat = await Category.create({
      ...rest,
      branchId,
      restaurantId: ctx.restaurantId,
    });
    return res.status(201).json({ success: true, data: cat, message: "Category created." });
  } catch (err) {
    if (err.code === 11000)
      return res.status(409).json({ success: false, message: "A category with this name already exists for this scope (branch or all-branches)." });
    return res.status(500).json({ success: false, message: "Server error.", error: err.message });
  }
};

/**
 * PUT /api/admin/categories/:id
 * Accepts `applyToAllBranches` the same way createCategory does, so editing
 * can switch a category between "this branch only" and "all branches".
 */
export const updateCategory = async (req, res) => {
  try {
    const { applyToAllBranches, ...rest } = req.body;
    const updates = { ...rest };
    if (applyToAllBranches !== undefined) {
      updates.branchId = applyToAllBranches ? null : (req.body.branchId || req.user.branchId || null);
    }

    const cat = await Category.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!cat) return res.status(404).json({ success: false, message: "Category not found." });
    return res.status(200).json({ success: true, data: cat, message: "Category updated." });
  } catch (err) {
    if (err.code === 11000)
      return res.status(409).json({ success: false, message: "A category with this name already exists for this scope." });
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/** DELETE /api/admin/categories/:id */
export const deleteCategory = async (req, res) => {
  try {
    // Check if any products exist in this category
    const productCount = await Product.countDocuments({ categoryId: req.params.id });
    if (productCount > 0)
      return res.status(400).json({
        success: false,
        message: `Cannot delete: ${productCount} product(s) exist in this category. Move or delete them first.`,
      });

    const cat = await Category.findByIdAndDelete(req.params.id);
    if (!cat) return res.status(404).json({ success: false, message: "Category not found." });
    return res.status(200).json({ success: true, message: "Category deleted." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
