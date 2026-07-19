import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import multer from "multer";
import rateLimit from "express-rate-limit";

import connectDB from "./Config/db.js";

import bridgeRoutes from "./Routes/bridgeRoutes.js";
import customerRoutes from "./Routes/customerRoutes.js";
import adminRoutes from "./Routes/adminRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Ensure Mongo is ready before handling API traffic (serverless-safe)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("DB middleware error:", err.message);
    res.status(503).json({ success: false, message: "Database unavailable" });
  }
});

app.use("/login", rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }));
app.use("/signup", rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }));
app.use("/api/admin/login", rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }));

const allowedOrigins = [
  process.env.FRONTEND_URL,
  ...(process.env.FRONTEND_URLS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
].filter(Boolean);

// Always allow same-origin / no-origin (serverless health checks, curl)
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      // Vercel preview deployments
      if (/^https:\/\/[\w-]+\.vercel\.app$/.test(origin)) return cb(null, true);
      if (process.env.NODE_ENV !== "production") return cb(null, true);
      return cb(new Error("CORS blocked"));
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

const imagesDir = path.join(__dirname, "../../frontend/public/images");
app.use("/images", express.static(imagesDir));

const getUploadDir = (type) => {
  const dir = path.join(imagesDir, type || "general");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, getUploadDir(req.query.type)),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ok = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    ok.includes(file.mimetype) ? cb(null, true) : cb(new Error("Images only"));
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file)
    return res.status(400).json({ success: false, message: "No file uploaded" });
  const type = req.query.type || "general";
  const imageUrl = `/images/${type}/${req.file.filename}`;
  res.json({ success: true, imageUrl, filename: req.file.filename });
});

app.get("/", (req, res) =>
  res.json({ success: true, message: "Restaurant Backend Running" }),
);
app.get("/api/health", (req, res) =>
  res.json({ success: true, status: "ok" }),
);

app.use(bridgeRoutes);
app.use(customerRoutes);
app.use(adminRoutes);

app.use((req, res) =>
  res.status(404).json({ success: false, message: "Route not found" }),
);
app.use((err, req, res, next) =>
  res.status(500).json({ success: false, message: err.message }),
);

export default app;
