import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import User from "./server/models/User.js";
import Profile from "./server/models/Profile.js";
import AllowedEmail from "./server/models/AllowedEmail.js";

async function fixSuperAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const email = "devanshujain@example.com";

        console.log(`Setting up Super Admin for ${email}...`);

        const user = await User.findOne({ email });
        if (!user) {
            console.log("User entry not found! Please sign up first.");
            return;
        }

        // 1. Update/Create Profile as Super Admin (hostel_id: null)
        let profile = await Profile.findOne({ user_id: user._id });
        if (profile) {
            profile.role = "admin";
            profile.hostel_id = null; // Super Admin is not tied to a hostel
            await profile.save();
            console.log("✅ Profile updated to SUPER ADMIN (No hostel).");
        } else {
            await Profile.create({
                user_id: user._id,
                role: "admin",
                hostel_id: null,
                full_name: user.full_name || "Super Admin"
            });
            console.log("✅ New Super Admin Profile created (No hostel).");
        }

        // 2. Update/Create AllowedEmail as Admin
        let allowed = await AllowedEmail.findOne({ email });
        if (allowed) {
            allowed.role = "admin";
            allowed.hostel_id = null;
            await allowed.save();
            console.log("✅ AllowedEmail entry updated to role: admin.");
        } else {
            await AllowedEmail.create({
                email,
                role: "admin",
                hostel_id: null
            });
            console.log("✅ New AllowedEmail entry created for Super Admin.");
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}
fixSuperAdmin();
