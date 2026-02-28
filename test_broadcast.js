
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import User from "./server/models/User.js";
import Profile from "./server/models/Profile.js";
import { Notification } from "./server/models/Notification.js";

const testBroadcast = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const user = await User.findOne({ email: "hmc@example.com" });
        if (!user) {
            console.log("User hmc@example.com not found");
            process.exit(0);
        }

        const profile = await Profile.findOne({ user_id: user._id });
        if (!profile || !profile.hostel_id) {
            console.log(`User profile or hostel info missing`);
            process.exit(0);
        }

        console.log(`Broadcasting as ${user.email} for hostel ${profile.hostel_id}...`);

        const notification = await Notification.create({
            hostel_id: profile.hostel_id,
            title: "Test Broadcast",
            message: "Testing from script",
            sent_by: user._id,
        });

        console.log("✅ Successful creation:", notification._id);
        process.exit(0);
    } catch (err) {
        console.error("❌ Failed creation:", err);
        process.exit(1);
    }
};

testBroadcast();
