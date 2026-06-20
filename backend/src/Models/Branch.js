import mongoose from "mongoose";

/**
 * Branch = a physical location of a Restaurant.
 * Each restaurant can have multiple branches.
 */
const branchSchema = new mongoose.Schema(
  {
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true },
    name:         { type: String, required: true },
    address:      { type: String, default: "" },
    city:         { type: String, required: true },
    areas:        { type: [String], default: [] },   // delivery zones
    phone:        { type: String, default: "" },
    status:       { type: String, enum: ["open","closed","maintenance"], default: "open" },
    tables:       { type: Number, default: 0 },
    openTime:     { type: String, default: "09:00" },
    closeTime:    { type: String, default: "23:00" },

    // POS
    posEnabled:   { type: Boolean, default: false },
    posSystem:    { type: String, default: "None" },
    posLastSync:  { type: Date, default: null },

    // Stats (cached, updated periodically — real-time comes from aggregations)
    rating:       { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    totalOrders:  { type: Number, default: 0 },

    // Delivery settings
    deliveryFee:  { type: Number, default: 0 },
    minOrderAmt:  { type: Number, default: 0 },
    deliveryTime: { type: String, default: "30-45 min" },
  },
  { timestamps: true, collection: "branches" }
);

const Branch = mongoose.model("Branch", branchSchema);
export default Branch;
