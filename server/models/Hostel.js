import mongoose from "mongoose";

const hostelSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    monthly_mess_fee: { type: Number, default: 4000 },
    daily_rebate_rate: { type: Number, default: 140 },
    semester_start_date: { type: Date, default: () => new Date(new Date().getFullYear(), 0, 1) }, // Defaults to Jan 1st
    created_at: { type: Date, default: Date.now },
});

const Hostel = mongoose.model("Hostel", hostelSchema);
export default Hostel;
