import mongoose from "mongoose";
import Category from "../Models/Category.js";

let cached = global._mongooseConn;
if (!cached) {
  cached = global._mongooseConn = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) return cached.conn;

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not set in .env");
  }

  if (!cached.promise) {
    const maxPoolSize = Number(process.env.MONGO_MAX_POOL_SIZE) || 10;

    cached.promise = mongoose
      .connect(process.env.MONGO_URI, {
        bufferCommands: false,
        maxPoolSize,
      })
      .then(async (conn) => {
        console.log("DB Connected Succesfull!");
        try {
          await Category.syncIndexes();
        } catch (indexErr) {
          console.warn("Could not sync Category indexes:", indexErr.message);
        }
        return conn;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error("MongoDB Error:", error.message);
    throw error;
  }

  return cached.conn;
};

export default connectDB;
