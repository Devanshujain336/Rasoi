import express from "express";
import Hostel from "../models/Hostel.js";
import AllowedEmail from "../models/AllowedEmail.js";
import Profile from "../models/Profile.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Middleware: admin only
const adminOnly = async (req, res, next) => {
    const profile = await Profile.findOne({ user_id: req.user._id });
    if (!profile || profile.role !== "admin") {
        return res.status(403).json({ error: "Admin access required." });
    }
    req.profile = profile;
    next();
};

// GET /api/admin/hostels
router.get("/hostels", protect, async (req, res) => {
    try {
        const hostels = await Hostel.find().sort({ name: 1 });
        res.json(hostels);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/admin/hostels
router.post("/hostels", protect, adminOnly, async (req, res) => {
    try {
        const { name, code } = req.body;
        if (!name?.trim() || !code?.trim()) {
            return res.status(400).json({ error: "Name and code are required." });
        }
        const hostel = await Hostel.create({ name: name.trim(), code: code.trim().toUpperCase() });
        res.status(201).json(hostel);
    } catch (err) {
        if (err.code === 11000) return res.status(409).json({ error: "Hostel name or code already exists." });
        res.status(500).json({ error: err.message });
    }
});

// POST /api/admin/import-students
router.post("/import-students", protect, adminOnly, async (req, res) => {
    try {
        const { hostel_id, emails, role = "student" } = req.body;
        if (!hostel_id || !emails?.length) {
            return res.status(400).json({ error: "hostel_id and emails are required." });
        }

        const hostel = await Hostel.findById(hostel_id);
        if (!hostel) return res.status(404).json({ error: "Hostel not found." });

        const ops = emails
            .map((raw) => raw.toLowerCase().trim())
            .filter((email) => email.includes("@"))
            .map((email) => ({
                updateOne: {
                    filter: { email },
                    update: { email, hostel_id, role },
                    upsert: true,
                },
            }));

        let imported = 0;
        if (ops.length > 0) {
            const result = await AllowedEmail.bulkWrite(ops);
            imported = result.upsertedCount + result.modifiedCount + result.matchedCount;
        }

        res.json({ imported, total: emails.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/admin/hostels/:id
router.delete("/hostels/:id", protect, adminOnly, async (req, res) => {
    try {
        const hostelId = req.params.id;
        console.log(`📡 DELETE request received for hostel: ${hostelId}`);

        // Verify hostel exists
        const hostel = await Hostel.findById(hostelId);
        if (!hostel) {
            console.log(`❌ Hostel ${hostelId} not found.`);
            return res.status(404).json({ error: "Hostel not found." });
        }

        console.log(`🗑️ Deleting hostel ${hostel.name} (${hostelId}) and all associated data...`);

        // 1. Delete Allowed Emails (Exclude Admins)
        const emailResult = await AllowedEmail.deleteMany({
            hostel_id: hostelId,
            role: { $ne: "admin" }
        });
        console.log(`- Deleted ${emailResult.deletedCount} allowed emails (Admins protected).`);

        // 2. Delete Forum Posts and Comments
        const ForumPost = (await import("../models/ForumPost.js")).default;
        const ForumComment = (await import("../models/ForumComment.js")).default;

        const posts = await ForumPost.find({ hostel_id: hostelId });
        const postIds = posts.map(p => p._id);

        const commentResult = await ForumComment.deleteMany({ post_id: { $in: postIds } });
        const postResult = await ForumPost.deleteMany({ hostel_id: hostelId });
        console.log(`- Deleted ${postResult.deletedCount} posts and ${commentResult.deletedCount} comments.`);

        // 3. Delete Notifications
        const notificationModule = await import("../models/Notification.js");
        const Notification = notificationModule.Notification;
        const NotificationRead = notificationModule.NotificationRead;

        const notifications = await Notification.find({ hostel_id: hostelId });
        const notifIds = notifications.map(n => n._id);

        await NotificationRead.deleteMany({ notification_id: { $in: notifIds } });
        const notifResult = await Notification.deleteMany({ hostel_id: hostelId });
        console.log(`- Deleted ${notifResult.deletedCount} notifications.`);

        // 4. Delete Profiles (Exclude Admins)
        const profileResult = await Profile.deleteMany({
            hostel_id: hostelId,
            role: { $ne: "admin" }
        });
        console.log(`- Deleted ${profileResult.deletedCount} student/MHMC profiles (Admins protected).`);

        // 5. Delete the Hostel itself
        await Hostel.findByIdAndDelete(hostelId);
        console.log("✅ Deletion complete.");

        res.json({
            message: `Hostel "${hostel.name}" and all associated data have been permanently deleted.`,
            stats: {
                emails: emailResult.deletedCount,
                posts: postResult.deletedCount,
                comments: commentResult.deletedCount,
                notifications: notifResult.deletedCount,
                profiles: profileResult.deletedCount
            }
        });
    } catch (err) {
        console.error("💥 DELETE HOSTEL ERROR:", err);
        res.status(500).json({
            error: "Failed to delete hostel. Check server logs.",
            details: err.message
        });
    }
});

// GET /api/admin/hostels/:id/emails
router.get("/hostels/:id/emails", protect, adminOnly, async (req, res) => {
    try {
        const emails = await AllowedEmail.find({ hostel_id: req.params.id }).sort({ created_at: -1 });
        res.json(emails);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
