import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import User from "./server/models/User.js";
import Profile from "./server/models/Profile.js";
import AllowedEmail from "./server/models/AllowedEmail.js";

async function verify() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const email = "devanshujain@example.com";
        const user = await User.findOne({ email });
        const profile = await Profile.findOne({ user_id: user?._id });
        const allowed = await AllowedEmail.findOne({ email });

        console.log("--- Super Admin Verification ---");
        console.log("Email:", email);
        console.log("Profile Role:", profile?.role);
        console.log("Profile Hostel ID:", profile?.hostel_id || "None (Super Admin)");
        console.log("Allowed Entry Role:", allowed?.role);
        console.log("Allowed Entry Hostel ID:", allowed?.hostel_id || "None");

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}
verify();
