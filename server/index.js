/**
 * index.js
 *
 * @description Entry Point for the Express Backend Server.
 */

console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
console.log("🚀 SERVER BOOTING: VERSION 1.0.3 - DIAGNOSTIC");
console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");

import dotenv from "dotenv";
dotenv.config(); // Reads from root .env

import dns from "node:dns";
// Force IPv4-first resolution to fix ENETUNREACH errors on Render
if (typeof dns.setDefaultResultOrder === "function") {
    dns.setDefaultResultOrder("ipv4first");
}

import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
// express-mongo-sanitize removed (incompatible with router v2 / Express 5 router)
// Inline sanitizer below handles NoSQL injection protection
import connectDB from "./db.js";
import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profiles.js";
import adminRoutes from "./routes/admin.js";
import forumRoutes from "./routes/forum.js";
import notificationRoutes from "./routes/notifications.js";
import billingRoutes from "./routes/billing.js";
import menuRoutes from "./routes/menu.js";

const app = express();
app.set("trust proxy", 1); // Trust Render's load balancer for rate limiting

// Simple Request Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

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

// Custom NoSQL sanitizer — strips keys starting with $ or containing .
// (express-mongo-sanitize is incompatible with the standalone `router` pkg)
const sanitizeObj = (obj) => {
    if (!obj || typeof obj !== "object") return obj;
    for (const key of Object.keys(obj)) {
        if (key.startsWith("$") || key.includes(".")) {
            delete obj[key];
        } else if (typeof obj[key] === "object") {
            sanitizeObj(obj[key]);
        }
    }
    return obj;
};
app.use((req, _res, next) => {
    if (req.body) sanitizeObj(req.body);
    if (req.params) sanitizeObj(req.params);
    next();
});

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
app.get("/api/ping", (req, res) => res.json({ message: "pong", version: "1.0.5", time: new Date().toISOString() }));

app.get("/api/health", (req, res) =>
    res.json({ status: "ok", time: new Date().toISOString() })
);

app.get("/", (req, res) => {
    res.send("Rasoi Backend API is running 🍛 [V1.0.5]");
});

// ── Route Printer (Diagnostic) ────────────────────────────────────────────────
function printRoutes(stack, prefix = "") {
    stack.forEach((layer) => {
        if (layer.route) {
            const methods = Object.keys(layer.route.methods).join(",").toUpperCase();
            console.log(`📍 [${methods}] ${prefix}${layer.route.path}`);
        } else if (layer.name === "router" && layer.handle.stack) {
            printRoutes(layer.handle.stack, prefix + layer.regexp.source.replace("^\\/", "").replace("\\/?(?=\\/|$)", ""));
        }
    });
}

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
    console.log(`\n--------------------------------------`);
    console.log(`🚀 RASOI SERVER STARTED [VERSION 1.0.5]`);
    console.log(`🔌 URL: http://localhost:${PORT}`);
    console.log(`🔍 REGISTERED ROUTES:`);
    try {
        printRoutes(app._router.stack);
    } catch (e) {
        console.log("⚠️ Could not print routes:", e.message);
    }
    console.log(`--------------------------------------\n`);
});
