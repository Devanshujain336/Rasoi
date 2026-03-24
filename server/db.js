/**
 * db.js
 * 
 * @description MongoDB Connection Helper.
 * @usage Called sequentially before starting the Express server.
 * @details Utilizes mongoose.connect wrapper with connection retry or error logging logic.
 */

import mongoose from "mongoose";

const connectDB = async () => {
    try {
        console.log("⏳ Connecting to MongoDB...");
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 100, // Handle up to 100 concurrent DB operations
            socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
            family: 4, // Force IPv4 to fix SRV ECONNREFUSED
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(`❌ MongoDB connection error: ${err.message}`);
        console.error("👉 Please check if your IP is whitelisted in MongoDB Atlas (Network Access).");
        process.exit(1);
    }
};

export default connectDB;
