import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import User from "./server/models/User.js";
import Profile from "./server/models/Profile.js";

async function listAll() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({});
        for (const u of users) {
            const p = await Profile.findOne({ user_id: u._id });
            console.log(JSON.stringify({ email: u.email, role: p?.role || "NONE", profile_id: p?._id }));
        }
        process.exit(0);
    } catch (err) {
        process.exit(1);
    }
}
listAll();
