/**
 * Rating.js
 * 
 * @description Mongoose Data Model for Rating.
 * @usage Import this model in routes & controllers to interact with the Rating MongoDB collection.
 * @details Defines schema structure, field validations, and potentially pre/post hooks for database operations.
 */

import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    meal: { type: String, enum: ["Breakfast", "Lunch", "Dinner"], required: true },
    score: { type: Number, enum: [1, 0, -1], required: true }, // 1: Fire/Good, 0: Neutral, -1: Sad/Bad
    created_at: { type: Date, default: Date.now }
});

// Indexes for performance and uniqueness
ratingSchema.index({ date: 1 });
ratingSchema.index({ user_id: 1, date: 1, meal: 1 }, { unique: true });

const Rating = mongoose.model("Rating", ratingSchema);
export default Rating;
