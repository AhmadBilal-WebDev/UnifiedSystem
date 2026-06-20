import Notification from "../../Models/Notification.js";
import mongoose from "mongoose";

/** GET /api/admin/notifications */
export const getNotifications = async (req, res) => {
  try {
    const { branchId, restaurantId } = req.user;
    const filter = {};
    if (branchId) filter.branchId = new mongoose.Types.ObjectId(branchId);
    else if (restaurantId) filter.restaurantId = new mongoose.Types.ObjectId(restaurantId);
    filter.$or = [
      { recipientId: new mongoose.Types.ObjectId(req.user.id) },
      { recipientId: null },
    ];

    const notifs = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(50);

    const unread = await Notification.countDocuments({ ...filter, read: false });

    return res.status(200).json({ success: true, data: notifs, unread });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/** PATCH /api/admin/notifications/:id/read */
export const markRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

/** PATCH /api/admin/notifications/read-all */
export const markAllRead = async (req, res) => {
  try {
    const { branchId, restaurantId } = req.user;
    const filter = {};
    if (branchId) filter.branchId = branchId;
    else if (restaurantId) filter.restaurantId = restaurantId;
    await Notification.updateMany(filter, { read: true });
    return res.status(200).json({ success: true, message: "All notifications marked as read." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
