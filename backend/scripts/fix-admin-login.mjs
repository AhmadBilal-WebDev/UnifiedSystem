/**
 * Restaurant System — Diagnose & Fix Admin Login
 * Run from backend/: npm run fix-login
 *
 * This checks every possible reason "admin@delightcrust.com" might not be
 * able to log in, prints exactly what it finds, and fixes it.
 */
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import bcryptjs from "bcryptjs";

const bcrypt = bcryptjs.default ?? bcryptjs;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/delightcrust";
const EMAIL = "admin@delightcrust.com";
const PASSWORD = "Admin@123";

async function main() {
  console.log("\n🔍 Step 1 — Connecting to MongoDB...");
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log("✅ Connected to:", MONGO_URI);
  } catch (err) {
    console.log("❌ COULD NOT CONNECT TO MONGODB.");
    console.log("   → Is MongoDB running on your machine?");
    console.log("   → Open MongoDB Compass or run 'mongod' in a terminal first.");
    console.log("   Error:", err.message);
    process.exit(1);
  }

  const db = mongoose.connection.db;
  const now = new Date();

  console.log("\n🔍 Step 2 — Checking for existing staff account...");
  const existingStaff = await db.collection("staff").findOne({ email: EMAIL });

  if (existingStaff) {
    console.log("✅ Found existing account:", existingStaff.email);
    console.log("   role:", existingStaff.role, "| accountType:", existingStaff.accountType, "| status:", existingStaff.status);
  } else {
    console.log("❌ No account found with email:", EMAIL);
    console.log("   → This is why login says 'account does not exist'.");
    console.log("   → Creating it now...");
  }

  console.log("\n🔍 Step 3 — Checking for restaurant + branch...");
  let restaurant = await db.collection("restaurants").findOne({ ownerEmail: EMAIL });
  let restaurantId, branchId;

  if (!restaurant) {
    console.log("❌ No restaurant found — creating one now...");
    const r = await db.collection("restaurants").insertOne({
      name: "Delight Crust",
      ownerName: "Restaurant Admin",
      ownerEmail: EMAIL,
      contactNumber: "+92-300-0000000",
      frontendUrl: "http://localhost:5173",
      backendUrl: "http://localhost:5000",
      status: "active",
      createdAt: now, updatedAt: now,
    });
    restaurantId = r.insertedId;
    console.log("✅ Restaurant created:", restaurantId.toString());

    const b = await db.collection("branches").insertOne({
      restaurantId,
      name: "Main Branch",
      address: "123 Main Street",
      city: "Karachi",
      areas: ["Gulshan", "Clifton", "DHA"],
      phone: "+92-21-0000000",
      status: "open",
      deliveryFee: 100,
      minOrderAmt: 500,
      deliveryTime: "30-45 min",
      createdAt: now, updatedAt: now,
    });
    branchId = b.insertedId;
    console.log("✅ Branch created:", branchId.toString());
  } else {
    restaurantId = restaurant._id;
    console.log("✅ Restaurant already exists:", restaurant.name);
    const branch = await db.collection("branches").findOne({ restaurantId });
    branchId = branch?._id || null;
    console.log(branchId ? `✅ Branch found: ${branchId}` : "⚠️  No branch found for this restaurant.");
  }

  console.log("\n🔍 Step 4 — Creating/resetting admin login...");
  const hashedPassword = await bcrypt.hash(PASSWORD, 12);

  await db.collection("staff").updateOne(
    { email: EMAIL },
    {
      $set: {
        name: "Restaurant Admin",
        email: EMAIL,
        password: hashedPassword,
        role: "client_admin",
        accountType: "client_admin",
        restaurantId,
        branchIds: branchId ? [branchId] : [],
        status: "active",
        updatedAt: now,
      },
      $setOnInsert: { createdAt: now, lastLogin: null },
    },
    { upsert: true }
  );
  console.log("✅ Admin login is ready (password reset to a known value).");

  console.log("\n🔍 Step 5 — Verifying password hash works...");
  const verify = await db.collection("staff").findOne({ email: EMAIL });
  const matches = await bcrypt.compare(PASSWORD, verify.password);
  console.log(matches ? "✅ Password verification PASSED." : "❌ Password verification FAILED — something is wrong with bcrypt.");

  console.log(`
╔══════════════════════════════════════════════════════╗
║              LOGIN IS NOW READY                      ║
╠══════════════════════════════════════════════════════╣
║                                                      ║
║  Go to: http://localhost:5173/admin                   ║
║                                                      ║
║  Email   : ${EMAIL}        
║  Password: ${PASSWORD}                                  
║                                                      ║
╚══════════════════════════════════════════════════════╝

If login STILL fails after this, the problem is not the
database — it's the connection between frontend and backend.
In that case:
  1. Make sure backend terminal shows "Backend → http://localhost:5000"
     with NO red errors.
  2. Open http://localhost:5000/api/health directly in your browser —
     it should show {"success":true,"status":"ok"}. If it doesn't load,
     your backend isn't running or crashed.
  3. Open the browser console (F12) on the login page, try logging in,
     and check the Network tab for the /api/admin/login request —
     copy whatever status code and response you see.
  `);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("\n❌ Unexpected error:", err.message);
  process.exit(1);
});
