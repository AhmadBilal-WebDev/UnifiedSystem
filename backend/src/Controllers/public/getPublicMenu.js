import Restaurant from "../../Models/Restaurant.js";
import Branch from "../../Models/Branch.js";
import Category from "../../Models/Category.js";
import Product from "../../Models/Product.js";

const normalizeUrl = (url) =>
  String(url || "")
    .toLowerCase()
    .replace(/^(https?:\/\/)?(www\.)?/, "")
    .replace(/\/$/, "")
    .trim();

/**
 * GET /user/menu?frontendUrl=...&city=...&branchId=...&area=...
 * Public endpoint used by the customer website to load the live menu.
 */
const getPublicMenu = async (req, res) => {
  try {
    const { frontendUrl, city, branchId, area } = req.query;

    if (!frontendUrl || !city) {
      return res.status(400).json({
        success: false,
        message: "frontendUrl and city parameters are required!",
      });
    }

    const cleanUrl = normalizeUrl(frontendUrl);

    const restaurant = await Restaurant.findOne({
      frontendUrl: { $regex: new RegExp(`^(https?:\\/\\/)?(www\\.)?${cleanUrl}(\\/)?$`, "i") },
      status: "active",
    }).lean();

    if (!restaurant) {
      return res.status(404).json({ success: false, message: "No active restaurant found matching this frontend URL." });
    }

    const branchQuery = {
      restaurantId: restaurant._id,
      city: { $regex: new RegExp(`^${city.trim()}$`, "i") },
      status: { $in: ["open", "active"] },
    };
    if (branchId) branchQuery._id = branchId;
    else if (area) branchQuery.areas = { $in: [area.trim()] };

    const branch = await Branch.findOne(branchQuery).lean();
    if (!branch) {
      return res.status(404).json({ success: false, message: `No active branch found for city '${city}'.` });
    }

    const categories = await Category.find({
      restaurantId: restaurant._id,
      $or: [{ branchId: branch._id }, { branchId: null }],
      active: true,
    }).sort({ sortOrder: 1, name: 1 }).lean();

    const products = await Product.find({
      restaurantId: restaurant._id,
      $or: [{ branchId: branch._id }, { branchId: null }],
      active: true,
    }).sort({ createdAt: -1 }).lean();

    const menu = categories.map((cat) => ({
      id: cat._id,
      name: cat.name,
      desc: cat.description || "",
      bannerImg: cat.bannerImg || "",
      icon: cat.icon || "",
      color: cat.color || "#f97316",
      items: products
        .filter((p) => p.categoryId?.toString() === cat._id.toString())
        .map((p) => ({
          id: p._id,
          name: p.name,
          price: p.price,
          desc: p.description || "",
          img: p.image || "",
          tags: p.tags || [],
          featured: p.featured,
          stock: p.stock,
          sizes: p.sizes || [],
          addons: p.addons || [],
          extras: p.extras || [],
        })),
    }));

    return res.status(200).json({
      success: true,
      message: `Menu loaded for ${branch.name} in ${city}!`,
      restaurantInfo: {
        restaurantId: restaurant._id,
        restaurantName: restaurant.name,
        branchId: branch._id,
        branchName: branch.name,
        city,
        deliveryFee: branch.deliveryFee,
        minOrderAmt: branch.minOrderAmt,
        deliveryTime: branch.deliveryTime,
      },
      menu,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error while fetching menu.", error: error.message });
  }
};

export default getPublicMenu;
