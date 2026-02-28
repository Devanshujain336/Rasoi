
import mongoose from "mongoose";
import dotenv from "dotenv";
import Hostel from "./server/models/Hostel.js";
import AllowedEmail from "./server/models/AllowedEmail.js";

dotenv.config();

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB...");

        // 1. Create a default hostel if none exists
        let hostel = await Hostel.findOne({ code: "H1" });
        if (!hostel) {
            hostel = await Hostel.create({ name: "Hostel 1", code: "H1" });
            console.log("Created default hostel: H1");
        } else {
            console.log("Found existing hostel: H1");
        }

        // 3. Check existing user and profile
        const emailCheck = "devanshujain@example.com";
        const User = (await import("./server/models/User.js")).default;
        const Profile = (await import("./server/models/Profile.js")).default;

        const user = await User.findOne({ email: emailCheck });
        if (user) {
            console.log(`Found user: ${user.email} (ID: ${user._id})`);
            const profile = await Profile.findOne({ user_id: user._id });
            if (profile) {
                console.log(`Found profile. Current role: ${profile.role}`);
                if (profile.role !== "admin") {
                    console.log("Updating role to admin...");
                    profile.role = "admin";
                    await profile.save();
                    console.log("Role updated successfully.");
                }
            } else {
                console.log("No profile found for this user!");
            }
        } else {
            console.log(`User ${emailCheck} not found. Please sign up on the website first.`);
        }

        console.log("Seeding completed successfully.");
        process.exit(0);
    } catch (err) {
        console.error("Seeding failed:", err);
        process.exit(1);
    }
}

seed();
