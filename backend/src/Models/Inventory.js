import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
  {
    restaurantId:   { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true },
    branchId:       { type: mongoose.Schema.Types.ObjectId, ref: "Branch",     required: true },
    name:           { type: String, required: true },
    category:       { type: String, default: "General" },
    unit:           { type: String, default: "pcs" },       // kg, L, pcs, etc.
    quantity:       { type: Number, required: true, default: 0 },
    reorderPoint:   { type: Number, default: 10 },
    reorderQty:     { type: Number, default: 50 },
    cost:           { type: Number, default: 0 },           // per unit cost
    supplier:       { type: String, default: "" },
    lastRestocked:  { type: Date, default: null },

    // Computed status (for UI)
    // "ok" | "low" | "critical" | "out" - derived from quantity vs reorderPoint
  },
  { timestamps: true, collection: "inventory" }
);

inventorySchema.virtual("stockStatus").get(function () {
  if (this.quantity <= 0) return "out";
  if (this.quantity <= this.reorderPoint * 0.5) return "critical";
  if (this.quantity <= this.reorderPoint) return "low";
  return "ok";
});

inventorySchema.set("toJSON", { virtuals: true });
inventorySchema.set("toObject", { virtuals: true });

const Inventory = mongoose.model("Inventory", inventorySchema);
export default Inventory;
