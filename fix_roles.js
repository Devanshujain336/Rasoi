
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import User from "./server/models/User.js";
import Profile from "./server/models/Profile.js";

const fixRole = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const user = await User.findOne();
        if (!user) {
            console.log("No users found");
            process.exit(0);
        }

        const profile = await Profile.findOne({ user_id: user._id });
        if (!profile) {
            console.log(`No profile found for user ${user.email}`);
            process.exit(0);
        }

        console.log(`Current user: ${user.email}, Role: ${profile.role}`);

        if (profile.role !== "admin" && profile.role !== "mhmc") {
            console.log("Updating role to 'admin'...");
            profile.role = "admin";
            await profile.save();
            console.log("Role updated successfully");
        } else {
            console.log("User is already an admin or mhmc");
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

fixRole();
