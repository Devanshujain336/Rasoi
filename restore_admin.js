import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import User from "./server/models/User.js";
import Profile from "./server/models/Profile.js";
import AllowedEmail from "./server/models/AllowedEmail.js";

async function restoreAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const email = "devanshujain@example.com";

        console.log(`Checking ${email}...`);

        const user = await User.findOne({ email });
        if (!user) {
            console.log("User not found!");
            return;
        }

        // 1. Update Profile
        let profile = await Profile.findOne({ user_id: user._id });
        if (profile) {
            profile.role = "admin";
            await profile.save();
            console.log("✅ Profile updated to ADMIN.");
        } else {
            console.log("❌ Profile not found.");
        }

        // 2. Update AllowedEmail
        let allowed = await AllowedEmail.findOne({ email });
        if (allowed) {
            allowed.role = "admin";
            await allowed.save();
            console.log("✅ AllowedEmail entry updated to ADMIN.");
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}
restoreAdmin();
