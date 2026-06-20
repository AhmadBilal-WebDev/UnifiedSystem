import Branch from "../../Models/Branch.js";
import StaffUser from "../../Models/StaffUser.js";

/**
 * GET /api/admin/branches
 * Superadmin sees all; client_admin sees own restaurant's; staff sees assigned branches.
 */
export const getBranches = async (req, res) => {
  try {
    const { role, restaurantId, branchIds } = req.user;
    let filter = {};

    if (role === "superadmin") {
      // See all, can filter by restaurantId
      if (req.query.restaurantId) filter.restaurantId = req.query.restaurantId;
    } else if (role === "client_admin") {
      filter.restaurantId = restaurantId;
    } else {
      // Staff: only their assigned branches
      filter._id = { $in: branchIds || [] };
    }

    const branches = await Branch.find(filter)
      .populate("restaurantId", "name logo color")
      .sort({ createdAt: 1 });

    return res.status(200).json({ success: true, data: branches });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error.", error: err.message });
  }
};

/** GET /api/admin/branches/:id */
export const getBranchById = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id).populate("restaurantId", "name logo color");
    if (!branch) return res.status(404).json({ success: false, message: "Branch not found." });
    return res.status(200).json({ success: true, data: branch });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/** POST /api/admin/branches */
export const createBranch = async (req, res) => {
  try {
    const restaurantId = req.user.restaurantId || req.body.restaurantId;
    if (!restaurantId)
      return res.status(400).json({ success: false, message: "restaurantId required." });

    const branch = await Branch.create({ ...req.body, restaurantId });
    return res.status(201).json({ success: true, data: branch, message: "Branch created." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error.", error: err.message });
  }
};

/** PUT /api/admin/branches/:id */
export const updateBranch = async (req, res) => {
  try {
    const branch = await Branch.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!branch) return res.status(404).json({ success: false, message: "Branch not found." });
    return res.status(200).json({ success: true, data: branch, message: "Branch updated." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/** DELETE /api/admin/branches/:id */
export const deleteBranch = async (req, res) => {
  try {
    if (req.user.role !== "superadmin" && req.user.role !== "client_admin")
      return res.status(403).json({ success: false, message: "Not allowed." });

    await Branch.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: "Branch deleted." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/** PATCH /api/admin/branches/:id/areas — add delivery area */
export const addArea = async (req, res) => {
  try {
    const { area } = req.body;
    if (!area) return res.status(400).json({ success: false, message: "Area name required." });

    const branch = await Branch.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { areas: area } },
      { new: true }
    );
    if (!branch) return res.status(404).json({ success: false, message: "Branch not found." });
    return res.status(200).json({ success: true, data: branch, message: "Area added." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/** DELETE /api/admin/branches/:id/areas — remove delivery area */
export const removeArea = async (req, res) => {
  try {
    const { area } = req.body;
    const branch = await Branch.findByIdAndUpdate(
      req.params.id,
      { $pull: { areas: area } },
      { new: true }
    );
    if (!branch) return res.status(404).json({ success: false, message: "Branch not found." });
    return res.status(200).json({ success: true, data: branch, message: "Area removed." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/** GET /api/branches/public — for customer site: get branches with areas */
export const getPublicBranches = async (req, res) => {
  try {
    const filter = { status: { $ne: "maintenance" } };
    if (req.query.restaurantId) filter.restaurantId = req.query.restaurantId;
    if (req.query.city) filter.city = new RegExp(req.query.city, "i");

    const branches = await Branch.find(filter, "name city areas status deliveryFee minOrderAmt deliveryTime openTime closeTime").sort({ name: 1 });
    return res.status(200).json({ success: true, data: branches });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
