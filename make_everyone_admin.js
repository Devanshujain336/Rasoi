import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import User from "./server/models/User.js";
import Profile from "./server/models/Profile.js";
import Hostel from "./server/models/Hostel.js";

async function makeEveryoneAdmin() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
        });
        console.log("Connected successfully to:", mongoose.connection.host);

        const users = await User.find({});
        console.log(`Found ${users.length} users.`);

        const hostel = await Hostel.findOne({ code: "H1" });
        if (!hostel) {
            console.log("Warning: Hostel H1 not found. Using null for hostel_id.");
        }

        for (const user of users) {
            let profile = await Profile.findOne({ user_id: user._id });
            if (!profile) {
                await Profile.create({
                    user_id: user._id,
                    hostel_id: hostel?._id || null,
                    full_name: user.full_name || "Admin User",
                    role: "admin"
                });
                console.log(`Created admin profile for ${user.email}`);
            } else {
                profile.role = "admin";
                await profile.save();
                console.log(`Updated ${user.email} to admin`);
            }
        }
        console.log("Done!");
    } catch (err) {
        console.error("Error occurred:", err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}
makeEveryoneAdmin();
