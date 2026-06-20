import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import multer from "multer";
import rateLimit from "express-rate-limit";

import connectDB from "./src/Config/db.js";

// ── Routes ────────────────────────────────────────────────────────
import bridgeRoutes    from "./src/Routes/bridgeRoutes.js";    // customer site: /login /signup /create /user/menu etc
import customerRoutes  from "./src/Routes/customerRoutes.js";  // /api/users/* (alt API surface, same data)
import adminRoutes     from "./src/Routes/adminRoutes.js";     // owner dashboard: /api/admin/*

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Rate Limiting ─────────────────────────────────────────────────
app.use("/login",         rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }));
app.use("/signup",        rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }));
app.use("/api/admin/login", rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }));

// ── CORS ─────────────────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) =>
    (!origin || allowedOrigins.includes(origin)) ? cb(null, true) : cb(new Error("CORS blocked")),
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

// ── Static Images ─────────────────────────────────────────────────
const imagesDir = path.join(__dirname, "../frontend/public/images");
app.use("/images", express.static(imagesDir));

// ── Image Upload ──────────────────────────────────────────────────
const getUploadDir = (type) => {
  const dir = path.join(imagesDir, type || "general");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, getUploadDir(req.query.type)),
  filename:    (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ok = ["image/jpeg","image/jpg","image/png","image/webp","image/gif"];
    ok.includes(file.mimetype) ? cb(null, true) : cb(new Error("Images only"));
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
  const type     = req.query.type || "general";
  const imageUrl = `/images/${type}/${req.file.filename}`;
  res.json({ success: true, imageUrl, filename: req.file.filename });
});

// ── Health ────────────────────────────────────────────────────────
app.get("/",           (req, res) => res.json({ success: true, message: "Restaurant Backend Running" }));
app.get("/api/health", (req, res) => res.json({ success: true, status: "ok" }));

// ── All Routes ────────────────────────────────────────────────────
app.use(bridgeRoutes);
app.use(customerRoutes);
app.use(adminRoutes);

// ── 404 & Error ───────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ success: false, message: "Route not found" }));
app.use((err, req, res, next) => res.status(500).json({ success: false, message: err.message }));

// ── Start ─────────────────────────────────────────────────────────
const start = async () => {
  await connectDB();
  console.log("🟢 MongoDB Connected");
  app.listen(PORT, () => {
    console.log(`\n🚀 Backend  → http://localhost:${PORT}`);
    console.log(`🌐 Website  → http://localhost:5173`);
    console.log(`🍽️  Dashboard → http://localhost:5173/admin\n`);
  });
};

start().catch(err => { console.error("❌", err.message); process.exit(1); });
