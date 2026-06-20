import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true },
    email:    { type: String, required: true, unique: true, lowercase: true },
    phone:    { type: String, required: true },
    city:     { type: String, default: "" },
    registeredFromWebsite: { type: String, default: "" },

    // Which branch they belong to (nearest / chosen)
    parentBranchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", default: null },
    restaurantId:   { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", default: null },

    // Simple password for customer login (hashed)
    passwordHash: { type: String, default: null },

    // Password reset
    otp:       { type: String, default: null },
    otpExpiry: { type: Date,   default: null },

    totalOrders:  { type: Number, default: 0 },
    totalSpent:   { type: Number, default: 0 },
    lastOrderAt:  { type: Date, default: null },
  },
  { timestamps: true, collection: "customers" }
);

const Customer = mongoose.model("Customer", customerSchema);
export default Customer;
