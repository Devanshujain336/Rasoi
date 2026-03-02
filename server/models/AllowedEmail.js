/**
 * AllowedEmail.js
 * 
 * @description Mongoose Data Model for AllowedEmail.
 * @usage Import this model in routes & controllers to interact with the AllowedEmail MongoDB collection.
 * @details Defines schema structure, field validations, and potentially pre/post hooks for database operations.
 */

import mongoose from "mongoose";

const allowedEmailSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    hostel_id: { type: mongoose.Schema.Types.ObjectId, ref: "Hostel", default: null },
    role: { type: String, enum: ["admin", "mhmc", "student", "munimji"], default: "student" },
    created_at: { type: Date, default: Date.now },
});

const AllowedEmail = mongoose.model("AllowedEmail", allowedEmailSchema);
export default AllowedEmail;
