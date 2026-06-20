import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  productId:    { type: String, default: "" },
  name:         { type: String, required: true },
  price:        { type: Number, required: true },
  qty:          { type: Number, required: true, default: 1 },
  total:        { type: Number, required: true },
  image:        { type: String, default: "" },
  selectedSize: { type: mongoose.Schema.Types.Mixed, default: null },
  addons:       { type: Array, default: [] },
  extras:       { type: Array, default: [] },
  instructions: { type: String, default: "" },
});

const orderSchema = new mongoose.Schema(
  {
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
    branchId:     { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
    userId:       { type: mongoose.Schema.Types.ObjectId, ref: "CustomerUser", default: null },

    // Customer info
    customerName:    { type: String, required: true },
    customerPhone:   { type: String, required: true },
    customerAddress: { type: String, default: "" },
    city:            { type: String, default: "" },
    area:            { type: String, default: "" },

    // Order details
    items:    [orderItemSchema],
    subtotal: { type: Number, required: true },
    tax:      { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total:    { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },

    // Enums matching the frontend
    status: {
      type: String,
      enum: ["pending","confirmed","preparing","ready","delivered","cancelled"],
      default: "pending",
    },

    // Counter confirmation status (for COD online orders needing a call)
    confirmStatus: {
      type: String,
      enum: ["pending_call","call_done","confirmed","rejected","no_answer", null],
      default: null,
    },

    source: {
      type: String,
      enum: ["counter","website","app","phone","foodpanda","careem","pos"],
      default: "website",
    },

    type: {
      type: String,
      enum: ["dine-in","takeaway","delivery"],
      default: "delivery",
    },

    paymentMethod: {
      type: String,
      enum: ["cod","card","jazzcash","easypaisa","online","pos_cash"],
      default: "cod",
    },

    tableNo:         { type: Number, default: null },
    note:            { type: String, default: "" },
    rejectionReason: { type: String, default: "" },
    callAttempts:    { type: Number, default: 0 },
    rating:          { type: Number, default: null },
    posSync:         { type: Boolean, default: false },
    completedAt:     { type: Date, default: null },

    // Website tracking (for multi-tenant customer frontend)
    registeredFromWebsite: { type: String, default: "" },
    deliveryTime:          { type: String, default: "30-45 min" },
  },
  { timestamps: true, collection: "orders" }
);

// Indexes for common queries
orderSchema.index({ branchId: 1, createdAt: -1 });
orderSchema.index({ restaurantId: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ confirmStatus: 1 });

const Order = mongoose.model("Order", orderSchema);
export default Order;
