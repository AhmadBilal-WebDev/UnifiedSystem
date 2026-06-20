/**
 * Restaurant System — First Time Setup
 * Run: node setup.mjs
 *
 * Creates: Restaurant + Branch + Admin (staff) user + sample category/product
 * so you can immediately see the live connection between Dashboard and Website.
 */
import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
const bcrypt = bcryptjs.default ?? bcryptjs;

const MONGO_URI = "mongodb://127.0.0.1:27017/delightcrust";

async function main() {
  console.log("\n🔌 Connecting to MongoDB...");
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected\n");

  const db  = mongoose.connection.db;
  const now = new Date();

  // ── 1. Restaurant ────────────────────────────────────────────────
  let restaurant = await db.collection("restaurants").findOne({ ownerEmail: "admin@delightcrust.com" });
  let restaurantId, branchId;

  if (!restaurant) {
    const r = await db.collection("restaurants").insertOne({
      name: "Delight Crust",
      logo: "DC",
      color: "#f97316",
      plan: "Pro",
      cuisine: "Fast Food",
      ownerName: "Restaurant Admin",
      ownerEmail: "admin@delightcrust.com",
      contactNumber: "+92-300-0000000",
      frontendUrl: "http://localhost:5173",
      backendUrl: "http://localhost:5000",
      status: "active",
      joinedDate: now,
      settings: { currency: "PKR", taxRate: 16, taxType: "Exclusive", timezone: "Asia/Karachi" },
      createdAt: now, updatedAt: now,
    });
    restaurantId = r.insertedId;
    console.log("✅ Restaurant created: Delight Crust");

    // ── 2. Branch ──────────────────────────────────────────────────
    const b = await db.collection("branches").insertOne({
      restaurantId,
      name: "Main Branch",
      address: "123 Main Street",
      city: "Karachi",
      areas: ["Gulshan", "Clifton", "DHA"],
      phone: "+92-21-0000000",
      status: "open",
      tables: 10,
      openTime: "09:00",
      closeTime: "23:00",
      posEnabled: false,
      posSystem: "None",
      rating: 0,
      totalRevenue: 0,
      totalOrders: 0,
      deliveryFee: 100,
      minOrderAmt: 500,
      deliveryTime: "30-45 min",
      createdAt: now, updatedAt: now,
    });
    branchId = b.insertedId;
    console.log("✅ Branch created: Main Branch");
  } else {
    restaurantId = restaurant._id;
    const existingBranch = await db.collection("branches").findOne({ restaurantId });
    branchId = existingBranch?._id;
    console.log("♻️  Restaurant already exists, reusing it");
  }

  // ── 3. Admin (Staff) user for Dashboard login ───────────────────
  const adminPass = await bcrypt.hash("Admin@123", 12);
  await db.collection("staff").updateOne(
    { email: "admin@delightcrust.com" },
    {
      $set: {
        name: "Restaurant Admin",
        email: "admin@delightcrust.com",
        password: adminPass,
        role: "client_admin",
        accountType: "client_admin",
        restaurantId,
        branchIds: branchId ? [branchId] : [],
        status: "active",
        updatedAt: now,
      },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true }
  );
  console.log("✅ Admin user ready (login to dashboard)");

  // ── 4. Sample Category + Product (so website shows something immediately) ─
  const existingCat = await db.collection("categories").findOne({ branchId });
  if (!existingCat && branchId) {
    const cat = await db.collection("categories").insertOne({
      restaurantId, branchId,
      name: "Burgers",
      description: "Juicy grilled burgers",
      icon: "B",
      color: "#f97316",
      bannerImg: "",
      sortOrder: 1,
      active: true,
      createdAt: now, updatedAt: now,
    });
    await db.collection("products").insertOne({
      restaurantId, branchId,
      categoryId: cat.insertedId,
      name: "Classic Beef Burger",
      description: "Beef patty, lettuce, cheese, our special sauce",
      price: 650,
      cost: 250,
      sku: "BRG-001",
      image: "",
      tags: ["bestseller"],
      allergens: ["gluten", "dairy"],
      calories: 540,
      prepTime: 12,
      sizes: [], addons: [], extras: [],
      active: true,
      featured: true,
      stock: "unlimited",
      stockQty: 0,
      sold: 0, rating: 0, ratingCount: 0,
      createdAt: now, updatedAt: now,
    });
    console.log("✅ Sample category + product added");
  } else {
    console.log("♻️  Categories already exist, skipping sample data");
  }

  console.log(`
╔══════════════════════════════════════════════════════╗
║              SETUP COMPLETE                          ║
╠══════════════════════════════════════════════════════╣
║                                                      ║
║  🌐 Customer Website                                 ║
║     http://localhost:5173                            ║
║                                                      ║
║  🍽️  Admin Dashboard                                  ║
║     http://localhost:5173/admin                      ║
║     Email   : admin@delightcrust.com                  ║
║     Password: Admin@123                              ║
║                                                      ║
╚══════════════════════════════════════════════════════╝
  `);

  await mongoose.disconnect();
}

main().catch(err => { console.error("❌", err.message); process.exit(1); });
