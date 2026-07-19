import dotenv from "dotenv";
dotenv.config();

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
import bridgeRoutes from "./src/Routes/bridgeRoutes.js";
import customerRoutes from "./src/Routes/customerRoutes.js";
import adminRoutes from "./src/Routes/adminRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// ── CORS (origins from .env only) ─────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL,
  ...(process.env.FRONTEND_URLS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length
      ? allowedOrigins
      : process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

// ── Rate limits (values from .env) ────────────────────────────────
const rateWindowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;
const rateMax = Number(process.env.RATE_LIMIT_MAX) || 20;
app.use("/login", rateLimit({ windowMs: rateWindowMs, max: rateMax }));
app.use("/signup", rateLimit({ windowMs: rateWindowMs, max: rateMax }));
app.use("/api/admin/login", rateLimit({ windowMs: rateWindowMs, max: rateMax }));

// ── Static images + upload ────────────────────────────────────────
const imagesDir =
  process.env.IMAGES_DIR ||
  path.join(__dirname, "../frontend/public/images");
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
  limits: {
    fileSize: Number(process.env.UPLOAD_MAX_BYTES) || 5 * 1024 * 1024,
  },
});

app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }
  const type = req.query.type || "general";
  const imageUrl = `/images/${type}/${req.file.filename}`;
  res.json({ success: true, imageUrl, filename: req.file.filename });
});

// ── Health ────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.send("Backend Connected Succesfull!");
});
app.get("/api/health", (req, res) =>
  res.json({ success: true, status: "ok" }),
);

// ── Routes ────────────────────────────────────────────────────────
app.use(bridgeRoutes);
app.use(customerRoutes);
app.use(adminRoutes);

app.use((req, res) =>
  res.status(404).json({ success: false, message: "Route not found" }),
);
app.use((err, req, res, next) =>
  res.status(500).json({ success: false, message: err.message }),
);

// ── Init DB (same pattern as core-admin-hub) ──────────────────────
const initialize = async () => {
  await connectDB();
};
initialize();

app.listen(PORT, () => {
  console.log(`Server is running on: http://localhost:${PORT}`);
});

export default app;
