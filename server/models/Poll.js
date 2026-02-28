import mongoose from "mongoose";

const pollSchema = new mongoose.Schema({
    suggestion: { type: String, required: true },
    day: { type: String, required: true },
    meal: { type: String, required: true },
    votes: { type: Number, default: 1 },
    totalStudents: { type: Number, default: 250 },
    by: { type: String, required: true },
    daysLeft: { type: Number, default: 30 },
    status: { type: String, enum: ["active", "approved", "rejected", "expired"], default: "active" },
    createdAt: { type: Date, default: Date.now },
    approvedBy: { type: String, default: null },
    implementationMonth: { type: String, default: null },
    votedBy: [{ type: String }], // Array of profile user_ids or full names
}, { timestamps: true });

const Poll = mongoose.model("Poll", pollSchema);
export default Poll;
