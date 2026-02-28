
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import User from "./server/models/User.js";
import Profile from "./server/models/Profile.js";

const debugUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find().limit(10);
        console.log(`Checking ${users.length} users...`);
        for (const u of users) {
            const p = await Profile.findOne({ user_id: u._id });
            console.log(`User: ${u.email} | Profile: ${p ? "Exists" : "MISSING"} | Role: ${p?.role} | Hostel: ${p?.hostel_id}`);
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
debugUser();
