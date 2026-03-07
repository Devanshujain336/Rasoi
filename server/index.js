/**
 * index.js
 *
 * @description Entry Point for the Express Backend Server.
 * @usage Run via Node.js to start the HTTP server listening on the defined PORT.
 * @details Configures global middleware (CORS, Rate Limiter, Body Parser, NoSQL Sanitizer)
 *          and mounts all route handlers. Connects to MongoDB.
 */

import dotenv from "dotenv";
dotenv.config(); // Reads from root .env (MONGO_URI, JWT_SECRET, PORT, CLIENT_URL)

import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import connectDB from "./db.js";
import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profiles.js";
import adminRoutes from "./routes/admin.js";
import forumRoutes from "./routes/forum.js";
import notificationRoutes from "./routes/notifications.js";
import billingRoutes from "./routes/billing.js";
import menuRoutes from "./routes/menu.js";

const app = express();
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === "production";

// ── Security Hardening ────────────────────────────────────────────────────────
app.use(helmet());
app.use(compression());
app.use(morgan(isProd ? "combined" : "dev"));

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = [
    process.env.CLIENT_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:8081",
    "http://127.0.0.1:8081",
    "http://localhost:8082",
    "http://127.0.0.1:8082",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8083",
].filter(Boolean);

app.use(cors({
    origin: isProd ? [process.env.CLIENT_URL].filter(Boolean) : allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
}));

// ── Body Parser + NoSQL Injection Protection ──────────────────────────────────
app.use(express.json({ limit: "10kb" }));       // Prevent oversized payloads
app.use(mongoSanitize());                        // Strip $ and . from user input — prevents NoSQL injection

// ── Rate Limiting — General API ───────────────────────────────────────────────
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,          // 15 minutes
    max: isProd ? 100 : 1000,           // 100 in prod, relaxed locally
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests from this IP, please try again after 15 minutes" },
});
app.use("/api/", limiter);

// ── Rate Limiting — Auth routes (strict brute-force protection) ───────────────
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,          // 15 minutes
    max: isProd ? 20 : 200,             // Only 20 login/register attempts per 15 min in prod
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many login attempts, please try again after 15 minutes" },
});

// ── Connect to MongoDB ────────────────────────────────────────────────────────
await connectDB();

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth", authLimiter, authRoutes);      // Strict rate limit on auth
app.use("/api/profiles", profileRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/forum", forumRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/menu", menuRoutes);

// ── Health Check ──────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) =>
    res.json({ status: "ok", time: new Date().toISOString() })
);

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error("💥 PROD_ERROR:", err.stack || err);
    res.status(500).json({
        error: isProd ? "Internal server error" : (err.message || "Internal server error"),
        stack: isProd ? null : err.stack,
        details: isProd ? null : err,
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
