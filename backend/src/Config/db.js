import mongoose from "mongoose";
import Category from "../Models/Category.js";

let cached = global._mongooseConn;
if (!cached) {
  cached = global._mongooseConn = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) return cached.conn;

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not set");
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGO_URI, {
        bufferCommands: false,
        maxPoolSize: process.env.VERCEL ? 5 : 10,
      })
      .then(async (conn) => {
        console.log("✅ MongoDB Connected");
        try {
          await Category.syncIndexes();
          console.log("✅ Category indexes synced");
        } catch (indexErr) {
          console.warn("⚠️  Could not sync Category indexes:", indexErr.message);
        }
        return conn;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error("❌ MongoDB Error:", error.message);
    throw error;
  }

  return cached.conn;
};

export default connectDB;
