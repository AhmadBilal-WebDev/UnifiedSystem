import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true },
    // null branchId = category is available on ALL branches of this restaurant
    branchId:     { type: mongoose.Schema.Types.ObjectId, ref: "Branch", default: null },
    name:         { type: String, required: true },
    description:  { type: String, default: "" },
    icon:         { type: String, default: "" },         // emoji or initials
    color:        { type: String, default: "#f97316" },
    bannerImg:    { type: String, default: "" },
    sortOrder:    { type: Number, default: 0 },
    active:       { type: Boolean, default: true },
  },
  { timestamps: true, collection: "categories" }
);

// Compound index: name unique per branch (or per restaurant, when branchId is null = all branches)
categorySchema.index({ restaurantId: 1, branchId: 1, name: 1 }, { unique: true });

const Category = mongoose.model("Category", categorySchema);
export default Category;
