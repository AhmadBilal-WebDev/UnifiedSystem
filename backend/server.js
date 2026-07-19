import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";
import connectDB from "./src/Config/db.js";

const PORT = process.env.PORT || 5000;

// Local / non-Vercel: start the HTTP server
if (!process.env.VERCEL) {
  const start = async () => {
    await connectDB();
    console.log("🟢 MongoDB Connected");
    app.listen(PORT, () => {
      console.log(`\n🚀 Backend  → http://localhost:${PORT}`);
      console.log(`🌐 Website  → http://localhost:5173`);
      console.log(`🍽️  Dashboard → http://localhost:5173/admin\n`);
    });
  };

  start().catch((err) => {
    console.error("❌", err.message);
    process.exit(1);
  });
}

// Vercel serverless: export the Express app (same pattern as core-admin-hub)
export default app;
