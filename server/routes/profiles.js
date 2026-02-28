import express from "express";
import Profile from "../models/Profile.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// GET /api/profiles/:userId
router.get("/:userId", protect, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user_id: req.params.userId }).populate("hostel_id");
        if (!profile) return res.status(404).json({ error: "Profile not found" });
        res.json(profile);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH /api/profiles/:userId
router.patch("/:userId", protect, async (req, res) => {
    try {
        // Only allow updating own profile (unless admin)
        if (req.user._id.toString() !== req.params.userId) {
            const myProfile = await Profile.findOne({ user_id: req.user._id });
            if (!myProfile || myProfile.role !== "admin") {
                return res.status(403).json({ error: "Not authorized to update this profile" });
            }
        }

        const { full_name, roll_number, room_number, phone } = req.body;
        const profile = await Profile.findOneAndUpdate(
            { user_id: req.params.userId },
            { full_name, roll_number, room_number, phone, updated_at: Date.now() },
            { new: true, runValidators: true }
        ).populate("hostel_id");

        if (!profile) return res.status(404).json({ error: "Profile not found" });
        res.json(profile);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
