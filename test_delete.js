import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

async function test() {
    const userId = "67bff61775a2f0f8789370d9"; // An ID from your database
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1h" });

    console.log("Generated Token:", token);

    const hostelId = "67c0018788597f8846be0689"; // A hostel ID
    const url = `http://localhost:3001/api/admin/hostels/${hostelId}`;

    console.log("Testing DELETE on:", url);

    try {
        const res = await fetch(url, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        console.log("Status:", res.status);
        const data = await res.json().catch(() => "EMPTY/HTML");
        console.log("Data:", data);

    } catch (err) {
        console.error("Fetch Error:", err.message);
    }
    process.exit(0);
}

test();
