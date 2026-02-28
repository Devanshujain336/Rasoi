
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import { Notification } from "./server/models/Notification.js";

const checkNotifs = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const latest = await Notification.find().sort({ created_at: -1 }).limit(5);
        console.log(`Found ${latest.length} notifications:`);
        latest.forEach(n => {
            console.log(`- [${n.created_at.toISOString()}] ${n.title}: ${n.message}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkNotifs();
