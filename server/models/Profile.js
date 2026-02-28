import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    hostel_id: { type: mongoose.Schema.Types.ObjectId, ref: "Hostel", default: null },
    full_name: { type: String, default: "" },
    roll_number: { type: String, default: "" },
    room_number: { type: String, default: "" },
    phone: { type: String, default: "" },
    avatar_url: { type: String, default: "" },
    role: { type: String, enum: ["admin", "mhmc", "student", "munimji"], default: "student" },
    is_blocked: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
});

profileSchema.pre("save", function () {
    this.updated_at = Date.now();
});

const Profile = mongoose.model("Profile", profileSchema);
export default Profile;
