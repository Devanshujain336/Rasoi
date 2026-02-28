
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import User from "./server/models/User.js";
import Profile from "./server/models/Profile.js";

const listUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const users = await User.find();
        console.log(`Found ${users.length} users`);

        for (const user of users) {
            const profile = await Profile.findOne({ user_id: user._id }).populate("hostel_id");
            console.log(`- ${user.email} -> Role: ${profile?.role || "none"}, Hostel: ${profile?.hostel_id?.name || "none"}`);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

listUsers();
