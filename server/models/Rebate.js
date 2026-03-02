/**
 * Rebate.js
 * 
 * @description Mongoose Data Model for Rebate.
 * @usage Import this model in routes & controllers to interact with the Rebate MongoDB collection.
 * @details Defines schema structure, field validations, and potentially pre/post hooks for database operations.
 */

import mongoose from "mongoose";

const rebateSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    hostel_id: { type: mongoose.Schema.Types.ObjectId, ref: "Hostel", required: true },
    from_date: { type: Date, required: true },
    to_date: { type: Date, required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "approved" },
    comment: { type: String, default: "" },
    created_at: { type: Date, default: Date.now },
});

const Rebate = mongoose.model("Rebate", rebateSchema);
export default Rebate;
