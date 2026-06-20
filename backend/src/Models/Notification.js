import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", default: null },
    branchId:     { type: mongoose.Schema.Types.ObjectId, ref: "Branch",     default: null },
    recipientId:  { type: mongoose.Schema.Types.ObjectId, ref: "StaffUser",  default: null }, // null = broadcast to all staff

    type:      { type: String, enum: ["order","alert","pos","review","system"], default: "system" },
    title:     { type: String, required: true },
    message:   { type: String, required: true },
    priority:  { type: String, enum: ["low","normal","high"], default: "normal" },
    read:      { type: Boolean, default: false },
    navTarget: { type: String, default: null },   // 'orders','counter','inventory','pos','analytics','branches','reports'
    navParam:  { type: String, default: null },   // e.g. orderId
  },
  { timestamps: true, collection: "notifications" }
);

notificationSchema.index({ branchId: 1, read: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
