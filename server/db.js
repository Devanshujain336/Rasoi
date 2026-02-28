import mongoose from "mongoose";

const connectDB = async () => {
    try {
        console.log("⏳ Connecting to MongoDB...");
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000, // 5 second timeout
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(`❌ MongoDB connection error: ${err.message}`);
        console.error("👉 Please check if your IP is whitelisted in MongoDB Atlas (Network Access).");
        process.exit(1);
    }
};

export default connectDB;
