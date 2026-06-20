import mongoose from "mongoose";
import Category from "../Models/Category.js";

const connectDB = async () => {
  try {
    console.log("🔍 RAW MONGO URI =", process.env.MONGO_URI);

    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB Connected");

    // Drop any stale indexes that no longer match the current schema
    // (e.g. the old {branchId,name} unique index on Category, replaced by
    // {restaurantId,branchId,name} to support "all branches" categories).
    try {
      await Category.syncIndexes();
      console.log("✅ Category indexes synced");
    } catch (indexErr) {
      console.warn("⚠️  Could not sync Category indexes:", indexErr.message);
    }
  } catch (error) {
    console.error("❌ MongoDB Error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
