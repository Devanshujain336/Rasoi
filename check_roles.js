import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import AllowedEmail from "./server/models/AllowedEmail.js";

async function checkRoles() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const stats = await AllowedEmail.aggregate([
            { $group: { _id: "$role", count: { $sum: 1 } } }
        ]);

        console.log("--- Role Distribution ---");
        stats.forEach(s => console.log(`${s._id || "No Role"}: ${s.count}`));

        if (stats.some(s => s._id === "mhmc")) {
            console.log("\n--- MHMC Emails ---");
            const mhmc = await AllowedEmail.find({ role: "mhmc" }).limit(20);
            mhmc.forEach(m => console.log(`- ${m.email}`));
        } else {
            console.log("\nNo MHMC emails found in the database.");
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}
checkRoles();
