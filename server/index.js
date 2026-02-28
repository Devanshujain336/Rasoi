import dotenv from "dotenv";
dotenv.config(); // Reads from root .env (MONGO_URI, JWT_SECRET, PORT, CLIENT_URL)

import express from "express";
import cors from "cors";
import connectDB from "./db.js";
import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profiles.js";
import adminRoutes from "./routes/admin.js";
import forumRoutes from "./routes/forum.js";
import notificationRoutes from "./routes/notifications.js";
import billingRoutes from "./routes/billing.js";

const app = express();
const PORT = process.env.PORT || 3001;

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
    "http://localhost:5175",
    "http://127.0.0.1:5175"
].filter(Boolean);

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/forum", forumRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/billing", billingRoutes);

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

// Global error handler
app.use((err, req, res, next) => {
    console.error("💥 ERROR HANDLER:", err);
    res.status(500).json({
        error: err.message || "Internal server error",
        stack: err.stack,
        details: err
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
