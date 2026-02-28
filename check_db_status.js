import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import AllowedEmail from "./server/models/AllowedEmail.js";
import Hostel from "./server/models/Hostel.js";

async function checkStatus() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);

        const hostels = await Hostel.find();
        console.log("\n--- Hostels ---");
        hostels.forEach(h => console.log(`${h.name} (Code: ${h.code}, ID: ${h._id})`));

        const allowed = await AllowedEmail.find().populate("hostel_id");
        console.log("\n--- Uploaded Database (Allowed Emails) ---");
        if (allowed.length === 0) {
            console.log("No emails uploaded yet.");
        } else {
            console.table(allowed.map(a => ({
                Email: a.email,
                Hostel: a.hostel_id?.name || "N/A",
                Role: a.role,
                UploadedAt: a.created_at.toLocaleString()
            })));
        }

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.disconnect();
    }
}

checkStatus();
