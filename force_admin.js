import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import User from "./server/models/User.js";
import Profile from "./server/models/Profile.js";
import AllowedEmail from "./server/models/AllowedEmail.js";

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const user = await User.findOne({ email: "devanshujain@example.com" });
        if (user) {
            console.log("USER FOUND:", user.email, "ID:", user._id);
            let profile = await Profile.findOne({ user_id: user._id });
            if (profile) {
                console.log("PROFILE ROLE:", profile.role);
                if (profile.role !== "admin") {
                    console.log("UPDATING TO ADMIN...");
                    profile.role = "admin";
                    await profile.save();
                    console.log("UPDATED TO ADMIN.");
                }
            } else {
                console.log("PROFILE MISSING. Creating one...");
                const Hostel = (await import("./server/models/Hostel.js")).default;
                const hostel = await Hostel.findOne({ code: "H1" });
                if (!hostel) throw new Error("Hostel H1 not found.");

                await Profile.create({
                    user_id: user._id,
                    hostel_id: hostel._id,
                    full_name: "Devanshu Jain",
                    role: "admin"
                });
                console.log("PROFILE CREATED AS ADMIN.");
            }
        } else {
            console.log("USER NOT FOUND");
        }

        const allowed = await AllowedEmail.findOne({ email: "devanshujain@example.com" });
        if (allowed) {
            console.log("ALLOWED EMAIL ENTRY FOUND. Allowed role:", allowed.role);
            if (allowed.role !== "admin") {
                console.log("UPDATING ALLOWED ROLE TO ADMIN...");
                allowed.role = "admin";
                await allowed.save();
                console.log("UPDATED ALLOWED ROLE.");
            }
        } else {
            console.log("NOT IN ALLOWED EMAIL LIST");
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
