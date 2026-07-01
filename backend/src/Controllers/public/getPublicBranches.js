import Restaurant from "../../Models/Restaurant.js";
import Branch from "../../Models/Branch.js";

const normalizeUrl = (url) =>
  String(url || "")
    .toLowerCase()
    .replace(/^(https?:\/\/)?(www\.)?/, "")
    .replace(/\/$/, "")
    .trim();

/**
 * GET /user/branches?domain=...
 * Returns all open branches + their delivery areas for a restaurant's website.
 */
const getPublicBranches = async (req, res) => {
  try {
    const { domain } = req.query;
    if (!domain) {
      return res.status(400).json({ success: false, message: "domain parameter is required." });
    }

    const cleanUrl = normalizeUrl(domain);

    const restaurant = await Restaurant.findOne({
      frontendUrl: { $regex: new RegExp(`^(https?:\\/\\/)?(www\\.)?${cleanUrl}(\\/)?$`, "i") },
      status: "active",
    }).lean();

    if (!restaurant) {
      return res.status(404).json({ success: false, message: "No active restaurant found for this domain." });
    }

    const branches = await Branch.find({
      restaurantId: restaurant._id,
      status: { $nin: ["closed", "maintenance"] },
    })
      .select("name city address areas phone deliveryFee minOrderAmt deliveryTime openTime closeTime")
      .sort({ city: 1, name: 1 })
      .lean();

    // NOTE: the customer website's fetchLocationData() does res.data.forEach(...),
    // so this endpoint must return a plain array, not a wrapped object.
    return res.status(200).json(
      branches.map((b) => ({
        _id: b._id,
        branchName: b.name,
        city: b.city,
        address: b.address || "",
        phone: b.phone || "",
        areas: b.areas,
        deliveryFee: b.deliveryFee,
        minOrderAmt: b.minOrderAmt,
        deliveryTime: b.deliveryTime,
        openTime: b.openTime || "",
        closeTime: b.closeTime || "",
      }))
    );
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error while fetching branches.", error: error.message });
  }
};

export default getPublicBranches;
