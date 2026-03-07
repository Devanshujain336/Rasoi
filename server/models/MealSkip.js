/**
 * MealSkip.js
 * 
 * @description Mongoose Data Model for MealSkip.
 * @usage Import in billing routes to record individual meal-level skips.
 * @details Each document represents one student skipping one meal on one day.
 *          Unique index on { user_id, date, meal } prevents double-submissions.
 */

import mongoose from "mongoose";

const mealSkipSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    hostel_id: { type: mongoose.Schema.Types.ObjectId, ref: "Hostel", required: true },
    date: { type: Date, required: true },            // stored as midnight UTC of the skipped day
    meal: { type: String, enum: ["breakfast", "lunch", "dinner"], required: true },
    created_at: { type: Date, default: Date.now },
});

// Prevent a student from submitting the same meal skip twice
mealSkipSchema.index({ user_id: 1, date: 1, meal: 1 }, { unique: true });

const MealSkip = mongoose.model("MealSkip", mealSkipSchema);
export default MealSkip;
