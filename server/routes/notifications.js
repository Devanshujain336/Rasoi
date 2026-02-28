import express from "express";
import { Notification, NotificationRead } from "../models/Notification.js";
import Profile from "../models/Profile.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// GET /api/notifications
router.get("/", protect, async (req, res) => {
    try {
        const myProfile = await Profile.findOne({ user_id: req.user._id });
        if (!myProfile?.hostel_id) return res.json({ notifications: [], readIds: [] });

        const [notifications, reads] = await Promise.all([
            Notification.find({ hostel_id: myProfile.hostel_id }).sort({ created_at: -1 }).limit(50),
            NotificationRead.find({ user_id: req.user._id }).select("notification_id"),
        ]);

        const readIds = reads.map((r) => r.notification_id.toString());
        res.json({ notifications, readIds });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/notifications  (broadcast)
router.post("/", protect, async (req, res) => {
    try {
        const myProfile = await Profile.findOne({ user_id: req.user._id });
        if (!myProfile || !["mhmc", "admin"].includes(myProfile.role)) {
            return res.status(403).json({ error: "Only MHMC/admin can send notifications." });
        }
        if (!myProfile.hostel_id) return res.status(400).json({ error: "No hostel assigned." });

        const { title, message } = req.body;
        if (!title?.trim() || !message?.trim()) return res.status(400).json({ error: "Title and message are required." });

        const notification = await Notification.create({
            hostel_id: myProfile.hostel_id,
            title: title.trim(),
            message: message.trim(),
            sent_by: req.user._id,
        });
        res.status(201).json(notification);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/notifications/reads  (mark one or many as read)
router.post("/reads", protect, async (req, res) => {
    try {
        const { notification_ids } = req.body;
        if (!notification_ids?.length) return res.status(400).json({ error: "notification_ids required." });

        const ops = notification_ids.map((id) => ({
            updateOne: {
                filter: { notification_id: id, user_id: req.user._id },
                update: { $setOnInsert: { notification_id: id, user_id: req.user._id } },
                upsert: true,
            },
        }));
        await NotificationRead.bulkWrite(ops);
        res.json({ marked: notification_ids.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
