import express from "express";
import Menu from "../models/Menu.js";
import Poll from "../models/Poll.js";
import Profile from "../models/Profile.js";
import Rating from "../models/Rating.js";
import { protect as authMiddleware } from "../middleware/auth.js";
import { z } from "zod";

const router = express.Router();

const ratingSubmitSchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    meal: z.enum(["Breakfast", "Lunch", "Dinner"]),
    score: z.union([z.literal(1), z.literal(0), z.literal(-1)])
});

const initialMenu = {
    Monday: { Breakfast: ["Poha", "Chai", "Banana"], Lunch: ["Dal", "Rice", "Roti", "Aloo Gobi"], Dinner: ["Paneer Butter Masala", "Naan", "Salad"] },
    Tuesday: { Breakfast: ["Idli", "Sambar", "Chutney"], Lunch: ["Rajma", "Rice", "Roti", "Raita"], Dinner: ["Chole", "Bhature", "Onion Salad"] },
    Wednesday: { Breakfast: ["Paratha", "Curd", "Pickle"], Lunch: ["Kadhi", "Rice", "Roti", "Mix Veg"], Dinner: ["Dal Makhani", "Jeera Rice", "Salad"] },
    Thursday: { Breakfast: ["Upma", "Chai", "Boiled Egg"], Lunch: ["Sambar", "Rice", "Roti", "Bhindi"], Dinner: ["Biryani", "Raita", "Gulab Jamun"] },
    Friday: { Breakfast: ["Bread", "Butter", "Omelette"], Lunch: ["Dal Fry", "Rice", "Roti", "Palak"], Dinner: ["Chicken/Paneer Curry", "Rice", "Roti"] },
    Saturday: { Breakfast: ["Chole Bhature", "Lassi"], Lunch: ["Aloo Matar", "Rice", "Roti", "Papad"], Dinner: ["Pav Bhaji", "Pulao", "Ice Cream"] },
    Sunday: { Breakfast: ["Puri", "Halwa", "Chana"], Lunch: ["Special Thali - Assorted"], Dinner: ["Fried Rice", "Manchurian", "Soup"] },
};

// GET menu and polls (public)
router.get("/", async (req, res) => {
    try {
        let menuDoc = await Menu.findOne();
        if (!menuDoc) {
            menuDoc = await Menu.create({ data: initialMenu });
        }
        const polls = await Poll.find().sort({ createdAt: -1 });
        res.json({ menu: menuDoc.data, polls });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// UPDATE menu (admin/mhmc only)
router.put("/", authMiddleware, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user_id: req.user._id });
        if (!profile || (profile.role !== "admin" && profile.role !== "mhmc")) {
            return res.status(403).json({ error: "Unauthorized: must be admin or mhmc" });
        }
        const { data } = req.body;
        let menuDoc = await Menu.findOne();
        if (!menuDoc) {
            menuDoc = await Menu.create({ data });
        } else {
            menuDoc.data = data;
            menuDoc.markModified("data");
            menuDoc.updated_at = Date.now();
            await menuDoc.save();
        }
        res.json({ message: "Menu updated successfully", menu: menuDoc.data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CREATE POLL (any logged in user)
router.post("/polls", authMiddleware, async (req, res) => {
    try {
        const { suggestion, day, meal } = req.body;
        const newPoll = new Poll({
            suggestion,
            day,
            meal,
            by: req.user.full_name || "Student",
            votedBy: [String(req.user._id)],
            votes: 1
        });
        await newPoll.save();
        res.status(201).json(newPoll);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// VOTE ON POLL (any logged in user)
router.post("/polls/:id/vote", authMiddleware, async (req, res) => {
    try {
        const userId = String(req.user._id);

        // Atomically increment votes and add user to votedBy only if not already present
        const poll = await Poll.findOneAndUpdate(
            { _id: req.params.id, votedBy: { $ne: userId } },
            { $inc: { votes: 1 }, $addToSet: { votedBy: userId } },
            { new: true }
        );

        if (!poll) {
            // Check if poll exists or already voted
            const exists = await Poll.findById(req.params.id);
            if (!exists) return res.status(404).json({ error: "Poll not found" });
            return res.status(400).json({ error: "You have already voted on this poll" });
        }

        res.json(poll);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// APPROVE/REJECT POLL (admin/mhmc only)
router.put("/polls/:id/status", authMiddleware, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user_id: req.user._id });
        if (!profile || (profile.role !== "admin" && profile.role !== "mhmc")) {
            return res.status(403).json({ error: "Unauthorized: must be admin or mhmc" });
        }

        const { status } = req.body;

        if (status === "rejected") {
            await Poll.findByIdAndDelete(req.params.id);
            return res.json({ message: "Poll rejected and removed successfully" });
        }

        const poll = await Poll.findById(req.params.id);
        if (!poll) return res.status(404).json({ error: "Poll not found" });

        poll.status = status;
        if (status === "approved") {
            poll.approvedBy = profile.full_name || "Admin";
            poll.implementationMonth = new Date().toLocaleString("default", { month: "long", year: "numeric" });

            // Auto-update the menu when poll is approved
            let menuDoc = await Menu.findOne();
            if (menuDoc && menuDoc.data) {
                if (!menuDoc.data[poll.day]) menuDoc.data[poll.day] = {};
                menuDoc.data[poll.day][poll.meal] = [poll.suggestion];
                menuDoc.markModified("data");
                await menuDoc.save();
            }
        }

        await poll.save();
        res.json(poll);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// SUBMIT RATING
router.post("/ratings", authMiddleware, async (req, res) => {
    try {
        const validation = ratingSubmitSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ error: validation.error.errors[0].message });
        }

        const { date, meal, score } = validation.data;
        const rating = await Rating.findOneAndUpdate(
            { user_id: req.user._id, date, meal },
            { score },
            { upsert: true, new: true }
        );
        res.json(rating);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET USER RATINGS FOR A DATE
router.get("/ratings/my", authMiddleware, async (req, res) => {
    try {
        const { date } = req.query;
        const ratings = await Rating.find({ user_id: req.user._id, date });
        res.json(ratings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET RATINGS STATS (MHMC/Admin/MunimJi)
router.get("/ratings/stats", authMiddleware, async (req, res) => {
    try {
        const { month } = req.query; // YYYY-MM
        const start = `${month}-01`;
        const end = `${month}-31`; // Simple approach

        const stats = await Rating.aggregate([
            { $match: { date: { $gte: start, $lte: end } } },
            {
                $group: {
                    _id: { date: "$date", meal: "$meal" },
                    avgScore: { $avg: "$score" },
                    total: { $sum: 1 },
                    positive: { $sum: { $cond: [{ $eq: ["$score", 1] }, 1, 0] } },
                    negative: { $sum: { $cond: [{ $eq: ["$score", -1] }, 1, 0] } }
                }
            }
        ]);

        // Format into a more usable object: { "2026-02-28": { Breakfast: 85, Lunch: 70, ... } }
        const formatted = {};
        stats.forEach(s => {
            const date = s._id.date;
            if (!formatted[date]) formatted[date] = {};
            // Satisfaction rate = (positive count / total count) * 100
            const rate = Math.round((s.positive / s.total) * 100);
            formatted[date][s._id.meal] = rate;
        });

        res.json(formatted);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
