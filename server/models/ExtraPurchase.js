/**
 * ExtraPurchase.js
 * 
 * @description Mongoose Data Model for ExtraPurchase.
 * @usage Import this model in routes & controllers to interact with the ExtraPurchase MongoDB collection.
 * @details Defines schema structure, field validations, and potentially pre/post hooks for database operations.
 */

import mongoose from "mongoose";

const extraPurchaseSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    hostel_id: { type: mongoose.Schema.Types.ObjectId, ref: "Hostel", required: true },
    item_name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, default: 1 },
    created_at: { type: Date, default: Date.now },
});

const ExtraPurchase = mongoose.model("ExtraPurchase", extraPurchaseSchema);
export default ExtraPurchase;
