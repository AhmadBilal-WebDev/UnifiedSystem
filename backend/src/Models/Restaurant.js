import mongoose from "mongoose";

/**
 * Restaurant = a "client" / "tenant" in the multi-restaurant SaaS.
 * One restaurant can have many branches.
 */
const restaurantSchema = new mongoose.Schema(
  {
    name:          { type: String, required: true },
    logo:          { type: String, default: "" },            // initials or image URL
    color:         { type: String, default: "#f97316" },     // brand color
    plan:          { type: String, enum: ["Starter","Pro","Enterprise"], default: "Pro" },
    cuisine:       { type: String, default: "Fast Food" },
    posSystem:     { type: String, default: "None" },
    ownerName:     { type: String, required: true },
    ownerEmail:    { type: String, required: true, unique: true },
    contactNumber: { type: String, default: "" },
    frontendUrl:   { type: String, default: "" },            // customer website
    backendUrl:    { type: String, default: "" },            // this API base
    status:        { type: String, enum: ["active","blocked","suspended"], default: "active" },
    joinedDate:    { type: Date, default: Date.now },
    settings: {
      currency:    { type: String, default: "PKR" },
      taxRate:     { type: Number, default: 16 },           // percentage
      taxType:     { type: String, enum: ["Inclusive","Exclusive"], default: "Exclusive" },
      timezone:    { type: String, default: "Asia/Karachi" },
    },
  },
  { timestamps: true, collection: "restaurants" }
);

const Restaurant = mongoose.models.Restaurant || mongoose.model("Restaurant", restaurantSchema);
export default Restaurant;
