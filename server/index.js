import dotenv from "dotenv";
dotenv.config(); // Reads from root .env (MONGO_URI, JWT_SECRET, PORT, CLIENT_URL)

import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
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

// Security Hardening
app.use(helmet());
app.use(compression());
app.use(morgan(isProd ? "combined" : "dev"));

// Rate Limiting (Prevent Brute Force)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests from this IP, please try again after 15 minutes" }
});
app.use("/api/", limiter);

// Connect to MongoDB
await connectDB();

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
    "http://127.0.0.1:5175"
].filter(Boolean);

app.use(cors({
    origin: isProd ? [process.env.CLIENT_URL].filter(Boolean) : allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json({ limit: "10kb" })); // Body limiter to prevent DOS

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/forum", forumRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/menu", menuRoutes);

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

// Global error handler
app.use((err, req, res, next) => {
    console.error("💥 PROD_ERROR:", err.stack || err);
    res.status(500).json({
        error: isProd ? "Internal server error" : (err.message || "Internal server error"),
        stack: isProd ? null : err.stack,
        details: isProd ? null : err
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
