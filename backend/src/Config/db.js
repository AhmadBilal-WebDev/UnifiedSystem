import mongoose from "mongoose";
import Category from "../Models/Category.js";

/**
 * Cached Mongo connection for local + Vercel serverless.
 * Always `await connectDB()` before any Model query.
 */
let cached = global._mongooseConn;
if (!cached) {
  cached = global._mongooseConn = {
    conn: null,
    promise: null,
    indexesSynced: false,
  };
}

const connectDB = async () => {
  // Already connected
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not set in .env");
  }

  if (!cached.promise) {
    const maxPoolSize = Number(process.env.MONGO_MAX_POOL_SIZE) || 10;

    cached.promise = mongoose
      .connect(process.env.MONGO_URI, {
        maxPoolSize,
        serverSelectionTimeoutMS: 20000,
        // Keep buffering ON until connected — middleware still awaits connect
        bufferCommands: true,
      })
      .then(async (m) => {
        console.log("DB Connected Succesfull!");
        if (!cached.indexesSynced) {
          try {
            await Category.syncIndexes();
            cached.indexesSynced = true;
          } catch (indexErr) {
            console.warn("Could not sync Category indexes:", indexErr.message);
          }
        }
        return m;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;
    console.error("MongoDB Error:", error.message);
    throw error;
  }

  return cached.conn;
};

export default connectDB;
