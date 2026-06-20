/**
 * RestaurantOS 2030 - Database Seeder
 * Run: node src/Seeds/seed.js
 *
 * Creates:
 *  - 1 Superadmin
 *  - 1 Sample Restaurant
 *  - 2 Branches
 *  - 1 Client Admin
 *  - 2 Staff members
 *  - Categories and Products
 *  - Inventory items
 *  - Sample orders (last 30 days)
 */

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Restaurant  from "../Models/Restaurant.js";
import Branch      from "../Models/Branch.js";
import StaffUser   from "../Models/StaffUser.js";
import Category    from "../Models/Category.js";
import Product     from "../Models/Product.js";
import Inventory   from "../Models/Inventory.js";
import Order       from "../Models/Order.js";
import Customer    from "../Models/Customer.js";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/restaurantos";

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // ─── Clean existing data ───────────────────────────────────────────────
    console.log("🗑  Clearing existing data...");
    await Promise.all([
      Restaurant.deleteMany({}),
      Branch.deleteMany({}),
      StaffUser.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Inventory.deleteMany({}),
      Order.deleteMany({}),
      Customer.deleteMany({}),
    ]);

    // ─── Superadmin ───────────────────────────────────────────────────────
    const superAdmin = await StaffUser.create({
      name:        "Super Admin",
      email:       process.env.SUPER_ADMIN_EMAIL || "superadmin@restaurantos.com",
      password:    process.env.SUPER_ADMIN_PASSWORD || "Admin@123",
      role:        "superadmin",
      accountType: "superadmin",
      avatar:      "SA",
      color:       "#a855f7",
      status:      "active",
    });
    console.log(`✅ Superadmin: ${superAdmin.email} / ${process.env.SUPER_ADMIN_PASSWORD || "Admin@123"}`);

    // ─── Restaurant ───────────────────────────────────────────────────────
    const restaurant = await Restaurant.create({
      name:          "BurgerBlast Co.",
      logo:          "BB",
      color:         "#f97316",
      plan:          "Enterprise",
      cuisine:       "Fast Food",
      posSystem:     "FoodPOS Pro",
      ownerName:     "Sara Khan",
      ownerEmail:    "sara@burgerblast.com",
      contactNumber: "+92-300-1234567",
      frontendUrl:   "http://localhost:5173",
      backendUrl:    "http://localhost:5000",
      status:        "active",
      settings: { currency: "PKR", taxRate: 16, taxType: "Exclusive", timezone: "Asia/Karachi" },
    });
    console.log(`✅ Restaurant: ${restaurant.name} (${restaurant._id})`);

    // ─── Branches ─────────────────────────────────────────────────────────
    const branch1 = await Branch.create({
      restaurantId: restaurant._id,
      name:         "Downtown Hub",
      address:      "12 Main St, City Center",
      city:         "Karachi",
      areas:        ["Saddar","Clifton","Gulshan","DHA"],
      phone:        "+92-21-3456789",
      status:       "open",
      tables:       28,
      openTime:     "08:00",
      closeTime:    "23:00",
      posEnabled:   true,
      posSystem:    "FoodPOS Pro",
      deliveryFee:  100,
      minOrderAmt:  500,
      deliveryTime: "30-45 min",
      rating:       4.7,
    });

    const branch2 = await Branch.create({
      restaurantId: restaurant._id,
      name:         "DHA Branch",
      address:      "7 Khayaban-e-Ittehad",
      city:         "Karachi",
      areas:        ["DHA Phase 1","DHA Phase 2","DHA Phase 5","DHA Phase 6"],
      phone:        "+92-21-5554321",
      status:       "open",
      tables:       32,
      openTime:     "10:00",
      closeTime:    "24:00",
      posEnabled:   true,
      posSystem:    "FoodPOS Pro",
      deliveryFee:  150,
      minOrderAmt:  600,
      deliveryTime: "25-40 min",
      rating:       4.8,
    });
    console.log(`✅ Branches: ${branch1.name}, ${branch2.name}`);

    // ─── Staff ────────────────────────────────────────────────────────────
    const clientAdmin = await StaffUser.create({
      name:         "Sara Khan",
      email:        "sara@burgerblast.com",
      password:     "Sara@123",
      role:         "client_admin",
      accountType:  "client_admin",
      restaurantId: restaurant._id,
      branchIds:    [branch1._id, branch2._id],
      avatar:       "SK",
      color:        "#f97316",
      status:       "active",
    });

    const branchManager = await StaffUser.create({
      name:           "Omar Sheikh",
      email:          "omar@burgerblast.com",
      password:       "Omar@123",
      role:           "branch_manager",
      accountType:    "staff",
      restaurantId:   restaurant._id,
      branchIds:      [branch1._id],
      parentBranchId: branch1._id,
      permissions:    [
        "orders.view","orders.create","orders.accept","orders.reject","orders.advance",
        "products.view","products.create","products.edit","products.toggle",
        "categories.view","branches.view","staff.view",
        "inventory.view","inventory.edit","inventory.restock",
        "analytics.view","reports.view","counter.view","counter.accept",
        "counter.reject","counter.call_log","kitchen.view","kitchen.advance",
      ],
      avatar:  "OS",
      color:   "#3b82f6",
      status:  "active",
    });

    const counterUser = await StaffUser.create({
      name:           "Bilal Counter",
      email:          "counter@burgerblast.com",
      password:       "Counter@123",
      role:           "counter",
      accountType:    "staff",
      restaurantId:   restaurant._id,
      branchIds:      [branch1._id],
      parentBranchId: branch1._id,
      permissions:    [
        "orders.view","orders.create","orders.accept","orders.reject",
        "counter.view","counter.accept","counter.reject","counter.call_log",
      ],
      avatar:  "BC",
      color:   "#22c55e",
      status:  "active",
    });
    console.log(`✅ Staff: ${clientAdmin.email}, ${branchManager.email}, ${counterUser.email}`);

    // ─── Categories ───────────────────────────────────────────────────────
    const cats = await Category.insertMany([
      { restaurantId: restaurant._id, branchId: branch1._id, name: "Burgers",   icon: "🍔", color: "#f97316", sortOrder: 1, active: true },
      { restaurantId: restaurant._id, branchId: branch1._id, name: "Sides",     icon: "🍟", color: "#eab308", sortOrder: 2, active: true },
      { restaurantId: restaurant._id, branchId: branch1._id, name: "Drinks",    icon: "🥤", color: "#3b82f6", sortOrder: 3, active: true },
      { restaurantId: restaurant._id, branchId: branch1._id, name: "Desserts",  icon: "🍰", color: "#ec4899", sortOrder: 4, active: true },
      { restaurantId: restaurant._id, branchId: branch1._id, name: "Combos",    icon: "🎁", color: "#22c55e", sortOrder: 5, active: true },
      // Branch 2 categories
      { restaurantId: restaurant._id, branchId: branch2._id, name: "Burgers",   icon: "🍔", color: "#f97316", sortOrder: 1, active: true },
      { restaurantId: restaurant._id, branchId: branch2._id, name: "Drinks",    icon: "🥤", color: "#3b82f6", sortOrder: 2, active: true },
    ]);
    const [catBurgers, catSides, catDrinks, catDesserts, catCombos, cat2Burgers, cat2Drinks] = cats;
    console.log(`✅ Categories created`);

    // ─── Products ─────────────────────────────────────────────────────────
    await Product.insertMany([
      // Branch 1 products
      { restaurantId: restaurant._id, branchId: branch1._id, categoryId: catBurgers._id, name: "Classic Smash Burger", description: "Two smashed beef patties, cheddar, special sauce, brioche bun", price: 850, cost: 310, sku: "BRG-001", tags: ["bestseller"], calories: 680, prepTime: 8, active: true, featured: true, sold: 342, rating: 4.8, sizes: [{ name: "Regular", price: 0 }, { name: "Large", price: 100 }] },
      { restaurantId: restaurant._id, branchId: branch1._id, categoryId: catBurgers._id, name: "Crispy Chicken Burger", description: "Buttermilk fried chicken, coleslaw, pickles, chipotle mayo", price: 780, cost: 280, sku: "BRG-002", tags: ["popular"], calories: 620, prepTime: 10, active: true, featured: false, sold: 289, rating: 4.6 },
      { restaurantId: restaurant._id, branchId: branch1._id, categoryId: catBurgers._id, name: "BBQ Bacon Stack", description: "Triple patty, crispy bacon, onion rings, BBQ sauce", price: 1150, cost: 420, sku: "BRG-003", tags: ["premium"], calories: 980, prepTime: 12, active: true, featured: true, sold: 187, rating: 4.9 },
      { restaurantId: restaurant._id, branchId: branch1._id, categoryId: catSides._id,   name: "Loaded Fries", description: "Seasoned fries, cheese sauce, jalapeños, sour cream", price: 450, cost: 130, sku: "SID-001", tags: ["popular"], calories: 520, prepTime: 5, active: true, sold: 512, rating: 4.4 },
      { restaurantId: restaurant._id, branchId: branch1._id, categoryId: catSides._id,   name: "Onion Rings", description: "Beer-battered jumbo onion rings, ranch dip", price: 350, cost: 100, sku: "SID-002", calories: 410, prepTime: 5, active: true, sold: 198, rating: 4.2 },
      { restaurantId: restaurant._id, branchId: branch1._id, categoryId: catDrinks._id,  name: "Classic Cola", description: "350ml fountain drink", price: 150, cost: 40, sku: "DRK-001", calories: 140, prepTime: 1, active: true, sold: 620, rating: 4.1 },
      { restaurantId: restaurant._id, branchId: branch1._id, categoryId: catDrinks._id,  name: "Thick Milkshake", description: "Chocolate, Vanilla or Strawberry", price: 420, cost: 140, sku: "DRK-002", tags: ["popular"], calories: 580, prepTime: 3, active: true, featured: true, sold: 398, rating: 4.7 },
      { restaurantId: restaurant._id, branchId: branch1._id, categoryId: catCombos._id,  name: "Family Combo", description: "6 burgers, 3 large fries, 6 drinks", price: 4500, cost: 1600, sku: "CMB-001", tags: ["value","bestseller"], calories: 3200, prepTime: 20, active: true, featured: true, sold: 143, rating: 4.8 },
      { restaurantId: restaurant._id, branchId: branch1._id, categoryId: catDesserts._id, name: "Molten Lava Cake", description: "Warm chocolate cake, vanilla ice cream", price: 380, cost: 110, sku: "DST-001", tags: ["new"], calories: 520, prepTime: 8, active: true, sold: 201, rating: 4.6 },
      // Branch 2 products
      { restaurantId: restaurant._id, branchId: branch2._id, categoryId: cat2Burgers._id, name: "Classic Smash Burger", description: "Two smashed beef patties, cheddar, special sauce, brioche bun", price: 850, cost: 310, sku: "B2-BRG-001", tags: ["bestseller"], active: true, featured: true, sold: 210, rating: 4.8 },
      { restaurantId: restaurant._id, branchId: branch2._id, categoryId: cat2Drinks._id,  name: "Classic Cola", description: "350ml fountain drink", price: 150, cost: 40, sku: "B2-DRK-001", active: true, sold: 380, rating: 4.1 },
    ]);
    console.log(`✅ Products created`);

    // ─── Inventory ────────────────────────────────────────────────────────
    await Inventory.insertMany([
      { restaurantId: restaurant._id, branchId: branch1._id, name: "Beef Patty (100g)", unit: "kg", quantity: 45, reorderPoint: 20, reorderQty: 50, cost: 1200, supplier: "FreshMeat Co.", lastRestocked: new Date(), category: "Meat" },
      { restaurantId: restaurant._id, branchId: branch1._id, name: "Brioche Buns",      unit: "pcs", quantity: 6, reorderPoint: 200, reorderQty: 500, cost: 35, supplier: "Bakers Plus", lastRestocked: new Date(), category: "Bread" },
      { restaurantId: restaurant._id, branchId: branch1._id, name: "Cheddar Slices",    unit: "pcs", quantity: 120, reorderPoint: 100, reorderQty: 300, cost: 25, supplier: "DairyFarm Co.", lastRestocked: new Date(), category: "Dairy" },
      { restaurantId: restaurant._id, branchId: branch1._id, name: "Frying Oil",        unit: "L", quantity: 28, reorderPoint: 15, reorderQty: 40, cost: 280, supplier: "OilsRUs", lastRestocked: new Date(), category: "Oil" },
      { restaurantId: restaurant._id, branchId: branch1._id, name: "Potatoes (Fries)",  unit: "kg", quantity: 90, reorderPoint: 30, reorderQty: 100, cost: 80, supplier: "FarmFresh", lastRestocked: new Date(), category: "Produce" },
      { restaurantId: restaurant._id, branchId: branch1._id, name: "Chicken Breast",    unit: "kg", quantity: 32, reorderPoint: 25, reorderQty: 50, cost: 980, supplier: "FreshMeat Co.", lastRestocked: new Date(), category: "Meat" },
    ]);
    console.log(`✅ Inventory created`);

    // ─── Sample Orders (7 days) ───────────────────────────────────────────
    const NAMES   = ["Ali Hassan","Sana Javed","Bilal Raza","Hina Mir","Usman Ali","Zara Khan","Tariq Butt"];
    const SOURCES = ["counter","website","app","phone","pos","foodpanda"];
    const PAYMENTS = ["cod","card","jazzcash","easypaisa"];
    const STATUSES = ["pending","confirmed","preparing","ready","delivered","cancelled"];

    const sampleOrders = [];
    for (let d = 6; d >= 0; d--) {
      const date = new Date(); date.setDate(date.getDate() - d);
      const count = Math.floor(Math.random() * 20) + 10;
      for (let i = 0; i < count; i++) {
        const branch = Math.random() > 0.5 ? branch1 : branch2;
        const source = SOURCES[Math.floor(Math.random() * SOURCES.length)];
        const payment = PAYMENTS[Math.floor(Math.random() * PAYMENTS.length)];
        const isOnline = ["website","app","foodpanda","careem"].includes(source);
        const isCOD = payment === "cod";
        const hour = Math.floor(Math.random() * 14) + 8;
        const items = [{ productId: "sample", name: "Classic Smash Burger", price: 850, qty: Math.floor(Math.random() * 3) + 1, total: 850 }];
        const subtotal = items.reduce((s, i) => s + i.total, 0);
        const status = d === 0 ? STATUSES[Math.floor(Math.random() * 4)] : "delivered";

        sampleOrders.push({
          restaurantId:  restaurant._id,
          branchId:      branch._id,
          customerName:  NAMES[Math.floor(Math.random() * NAMES.length)],
          customerPhone: `030${Math.floor(10000000 + Math.random() * 90000000)}`,
          city:          "Karachi",
          area:          "Saddar",
          items,
          subtotal,
          tax:      Math.round(subtotal * 0.16),
          discount: 0,
          total:    Math.round(subtotal * 1.16),
          deliveryFee: isOnline ? 100 : 0,
          status,
          confirmStatus: isOnline && isCOD && d <= 1 ? "pending_call" : (isOnline && isCOD ? "confirmed" : null),
          source, type: source === "counter" || source === "pos" ? "dine-in" : "delivery",
          paymentMethod: payment,
          createdAt: new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, Math.floor(Math.random() * 60)),
          completedAt: d > 0 ? new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour + 1) : null,
        });
      }
    }
    await Order.insertMany(sampleOrders);
    console.log(`✅ ${sampleOrders.length} sample orders created`);

    // ─── Print summary ────────────────────────────────────────────────────
    console.log("\n═══════════════════════════════════════════════");
    console.log("  🚀 RestaurantOS Database Seed Complete!");
    console.log("═══════════════════════════════════════════════");
    console.log(`  Superadmin:     ${superAdmin.email} / ${process.env.SUPER_ADMIN_PASSWORD || "Admin@123"}`);
    console.log(`  Client Admin:   sara@burgerblast.com / Sara@123`);
    console.log(`  Branch Manager: omar@burgerblast.com / Omar@123`);
    console.log(`  Counter:        counter@burgerblast.com / Counter@123`);
    console.log(`  Restaurant ID:  ${restaurant._id}`);
    console.log(`  Branch 1 ID:    ${branch1._id}`);
    console.log(`  Branch 2 ID:    ${branch2._id}`);
    console.log("═══════════════════════════════════════════════\n");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
}

seed();
