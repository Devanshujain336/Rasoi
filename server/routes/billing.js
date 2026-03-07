/**
 * billing.js
 * 
 * @description Express Router for Billing endpoints.
 * @usage Mount inside the main server/index.js file (e.g., app.use('/api/billing', router)).
 * @details Handles incoming HTTP requests, performs business logic using models, handles errors, and returns JSON responses. Routes are often protected via auth middleware.
 */

import express from "express";
import Rebate from "../models/Rebate.js";
import MealSkip from "../models/MealSkip.js";
import ExtraPurchase from "../models/ExtraPurchase.js";
import Profile from "../models/Profile.js";
import Hostel from "../models/Hostel.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Helper: given a meal type, return the latest IST time (as hour) a skip can be submitted
// Breakfast 08:00 → deadline 05:00, Lunch 13:00 → deadline 10:00, Dinner 20:00 → deadline 17:00
const MEAL_DEADLINES = { breakfast: 5, lunch: 10, dinner: 17 };

const isSkipAllowed = (meal) => {
    const nowIST = new Date(Date.now() + 5.5 * 60 * 60 * 1000); // UTC → IST offset
    const hourIST = nowIST.getUTCHours();
    return hourIST < MEAL_DEADLINES[meal];
};

const todayMidnightUTC = () => {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    return d;
};

// --- REBATE ROUTES ---

// GET /api/billing/rebates (My rebates)
router.get("/rebates", protect, async (req, res) => {
    try {
        const rebates = await Rebate.find({ user_id: req.user._id }).sort({ created_at: -1 });
        res.json(rebates);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/billing/rebates (Apply for rebate)
router.post("/rebates", protect, async (req, res) => {
    try {
        const { from_date, to_date, reason } = req.body;
        const profile = await Profile.findOne({ user_id: req.user._id });

        if (!profile?.hostel_id) return res.status(400).json({ error: "Hostel not assigned." });

        const rebate = await Rebate.create({
            user_id: req.user._id,
            hostel_id: profile.hostel_id,
            from_date,
            to_date,
            reason,
            status: "approved"
        });

        res.status(201).json(rebate);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// --- MEAL SKIP ROUTES ---

// POST /api/billing/meal-skips  (Student submits a meal skip)
router.post("/meal-skips", protect, async (req, res) => {
    try {
        const { meal } = req.body;
        if (!["breakfast", "lunch", "dinner"].includes(meal)) {
            return res.status(400).json({ error: "Invalid meal type. Use breakfast, lunch, or dinner." });
        }

        if (!isSkipAllowed(meal)) {
            return res.status(400).json({ error: "Submission window has closed for this meal (deadline is 3 hours before mealtime)." });
        }

        const profile = await Profile.findOne({ user_id: req.user._id });
        if (!profile?.hostel_id) return res.status(400).json({ error: "Hostel not assigned." });

        const skip = await MealSkip.create({
            user_id: req.user._id,
            hostel_id: profile.hostel_id,
            date: todayMidnightUTC(),
            meal,
        });
        res.status(201).json(skip);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ error: "You have already skipped this meal today." });
        }
        res.status(400).json({ error: err.message });
    }
});

// GET /api/billing/meal-skips  (Student's own skips – current month)
router.get("/meal-skips", protect, async (req, res) => {
    try {
        const startOfMonth = new Date();
        startOfMonth.setUTCDate(1);
        startOfMonth.setUTCHours(0, 0, 0, 0);
        const skips = await MealSkip.find({
            user_id: req.user._id,
            date: { $gte: startOfMonth },
        }).sort({ date: -1, meal: 1 });
        res.json(skips);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/billing/meal-skips/today  (Munimji / Admin – head-count for today's meals)
router.get("/meal-skips/today", protect, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user_id: req.user._id });
        if (!profile || !["admin", "mhmc", "munimji"].includes(profile.role)) {
            return res.status(403).json({ error: "Access denied." });
        }

        const today = todayMidnightUTC();
        const query = profile.role === "admin"
            ? { date: today }
            : { date: today, hostel_id: profile.hostel_id };

        const skips = await MealSkip.find(query);

        // Enrich with student name/roll
        const enriched = await Promise.all(skips.map(async (s) => {
            const st = await Profile.findOne({ user_id: s.user_id });
            return {
                _id: s._id,
                meal: s.meal,
                name: st?.full_name || "Unknown",
                roll: st?.roll_number || "N/A",
                room: st?.room_number || "N/A",
            };
        }));

        // Group into per-meal summaries
        const meals = ["breakfast", "lunch", "dinner"];
        const summary = meals.map((meal) => {
            const students = enriched.filter(e => e.meal === meal);
            return { meal, count: students.length, students };
        });

        res.json(summary);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/billing/meal-skips/:id  (Student cancels their own skip – only if deadline not passed)
router.delete("/meal-skips/:id", protect, async (req, res) => {
    try {
        const skip = await MealSkip.findById(req.params.id);
        if (!skip) return res.status(404).json({ error: "Meal skip not found." });

        // Only the owner can cancel
        if (skip.user_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Access denied." });
        }

        // Can only cancel if deadline hasn't passed
        if (!isSkipAllowed(skip.meal)) {
            return res.status(400).json({ error: "Cancellation window has closed for this meal." });
        }

        await MealSkip.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Meal skip cancelled." });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// --- EXTRAS ROUTES ---

// GET /api/billing/extras (My extras)
router.get("/extras", protect, async (req, res) => {
    try {
        const extras = await ExtraPurchase.find({ user_id: req.user._id }).sort({ created_at: -1 });
        res.json(extras);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- BILLING CALCULATION ---

// GET /api/billing/summary
router.get("/summary", protect, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user_id: req.user._id }).populate("hostel_id");
        if (!profile?.hostel_id) return res.status(400).json({ error: "Hostel not assigned." });

        const hostel = profile.hostel_id;

        // 1. Calculate base mess fee (Simulated for current month)
        const baseMessFee = hostel.monthly_mess_fee;

        // 2. Fetch approved rebates for calculation
        const approvedRebates = await Rebate.find({
            user_id: req.user._id,
            status: "approved"
        });

        let totalRebateAmount = 0;
        approvedRebates.forEach(r => {
            const days = Math.ceil((new Date(r.to_date) - new Date(r.from_date)) / (1000 * 60 * 60 * 24)) + 1;
            totalRebateAmount += days * hostel.daily_rebate_rate;
        });

        // 3. Fetch meal skips (current month)
        const startOfMonth = new Date();
        startOfMonth.setUTCDate(1);
        startOfMonth.setUTCHours(0, 0, 0, 0);
        const mealSkips = await MealSkip.find({ user_id: req.user._id, date: { $gte: startOfMonth } });
        const perMealRate = Math.round(hostel.daily_rebate_rate / 3);
        const mealSkipTotal = mealSkips.length * perMealRate;

        // 4. Fetch extras
        const extras = await ExtraPurchase.find({ user_id: req.user._id });
        const extrasTotal = extras.reduce((sum, e) => sum + (e.price * e.quantity), 0);

        const netBill = baseMessFee + extrasTotal - totalRebateAmount - mealSkipTotal;

        res.json({
            base_fee: baseMessFee,
            extras_total: extrasTotal,
            rebate_total: totalRebateAmount,
            meal_skip_total: mealSkipTotal,
            meal_skip_count: mealSkips.length,
            per_meal_rate: perMealRate,
            net_bill: netBill,
            hostel_name: hostel.name,
            currency: "INR"
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- MANAGEMENT ROUTES (Admin/MHMC) ---

// GET /api/billing/rebates/all (View all for my hostel)
router.get("/rebates/all", protect, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user_id: req.user._id });
        if (!profile || !["admin", "mhmc", "munimji"].includes(profile.role)) {
            return res.status(403).json({ error: "Access denied." });
        }

        const query = profile.role === "admin" ? {} : { hostel_id: profile.hostel_id };
        const rebates = await Rebate.find(query)
            .sort({ created_at: -1 });

        // Populate with Profile details instead of just user email for better context
        const populatedRebates = await Promise.all(rebates.map(async (reb) => {
            const st = await Profile.findOne({ user_id: reb.user_id });
            return {
                ...reb.toObject(),
                student: {
                    name: st?.full_name || "Unknown",
                    roll: st?.roll_number || "N/A"
                }
            };
        }));

        res.json(populatedRebates);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH /api/billing/rebates/:id (Approve/Reject)
router.patch("/rebates/:id", protect, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user_id: req.user._id });
        if (!profile || !["admin", "mhmc"].includes(profile.role)) {
            return res.status(403).json({ error: "Access denied." });
        }

        const { status, comment } = req.body;
        const rebate = await Rebate.findById(req.params.id);
        if (!rebate) return res.status(404).json({ error: "Rebate not found." });

        // Ensure MHMC only approves for their hostel
        if (profile.role === "mhmc" && rebate.hostel_id.toString() !== profile.hostel_id.toString()) {
            return res.status(403).json({ error: "Access denied for this hostel." });
        }

        rebate.status = status;
        rebate.comment = comment || rebate.comment;
        await rebate.save();

        res.json(rebate);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// DELETE /api/billing/rebates/:id (Cancel/remove rebate if arrived)
router.delete("/rebates/:id", protect, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user_id: req.user._id });
        if (!profile || !["admin", "mhmc", "munimji"].includes(profile.role)) {
            return res.status(403).json({ error: "Access denied." });
        }

        const rebate = await Rebate.findById(req.params.id);
        if (!rebate) return res.status(404).json({ error: "Rebate not found." });

        if (profile.role !== "admin" && rebate.hostel_id.toString() !== profile.hostel_id.toString()) {
            return res.status(403).json({ error: "Access denied for this hostel." });
        }

        await Rebate.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Rebate removed successfully." });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// --- MANAGEMENT ROUTES (Admin/MHMC/Munimji) ---

// Search students
router.get("/students/search", protect, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user_id: req.user._id });
        if (!profile || !["admin", "munimji", "mhmc"].includes(profile.role)) {
            return res.status(403).json({ error: "Access denied." });
        }

        const { q } = req.query;
        if (!q) return res.json([]);

        const query = {
            $or: [
                { full_name: { $regex: q, $options: "i" } },
                { roll_number: { $regex: q, $options: "i" } }
            ]
        };

        if (profile.role !== "admin") {
            query.hostel_id = profile.hostel_id;
        }

        const students = await Profile.find(query).limit(10);

        const results = await Promise.all(students.map(async (st) => {
            const startOfMonth = new Date();
            startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0);
            const extras = await ExtraPurchase.find({ user_id: st.user_id, created_at: { $gte: startOfMonth } });
            const monthExtras = extras.reduce((sum, e) => sum + (e.price * e.quantity), 0);
            return {
                id: st.user_id,
                name: st.full_name,
                roll: st.roll_number,
                floor: st.room_number,
                monthExtras
            };
        }));

        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Post extra items
router.post("/extras", protect, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user_id: req.user._id });
        if (!profile || !["admin", "munimji"].includes(profile.role)) {
            return res.status(403).json({ error: "Access denied." });
        }

        const { student_id, items } = req.body;
        const studentProfile = await Profile.findOne({ user_id: student_id });
        if (!studentProfile) return res.status(404).json({ error: "Student not found." });

        if (profile.role !== "admin" && studentProfile.hostel_id?.toString() !== profile.hostel_id?.toString()) {
            return res.status(403).json({ error: "Cannot bill student from another hostel." });
        }

        const purchases = items.map(i => ({
            user_id: student_id,
            hostel_id: studentProfile.hostel_id,
            item_name: i.name,
            price: i.price,
            quantity: i.quantity,
            created_at: new Date()
        }));

        await ExtraPurchase.insertMany(purchases);
        res.status(201).json({ success: true, message: "Billed successfully" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Recent extras transactions
router.get("/extras/recent", protect, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user_id: req.user._id });
        if (!profile || !["admin", "munimji"].includes(profile.role)) {
            return res.status(403).json({ error: "Access denied." });
        }

        const query = profile.role === "admin" ? {} : { hostel_id: profile.hostel_id };
        const extras = await ExtraPurchase.find(query)
            .sort({ created_at: -1 })
            .limit(20);

        const results = await Promise.all(extras.map(async (e) => {
            const st = await Profile.findOne({ user_id: e.user_id });
            return {
                id: e._id,
                student: st?.full_name || "Unknown",
                roll: st?.roll_number || "N/A",
                item_name: e.item_name,
                price: e.price,
                quantity: e.quantity,
                time: e.created_at
            };
        }));

        // Group by user and roughly same time
        const grouped = [];
        results.forEach(r => {
            const timeDiffStr = new Date(r.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const existing = grouped.find(g => g.student === r.student && g.time === timeDiffStr);
            if (existing) {
                existing.items.push(`${r.item_name}${r.quantity > 1 ? ` ×${r.quantity}` : ''}`);
                existing.total += r.price * r.quantity;
            } else {
                grouped.push({
                    student: r.student,
                    roll: r.roll,
                    items: [`${r.item_name}${r.quantity > 1 ? ` ×${r.quantity}` : ''}`],
                    total: r.price * r.quantity,
                    time: timeDiffStr,
                    rawTime: r.time
                });
            }
        });

        res.json(grouped.sort((a, b) => new Date(b.rawTime) - new Date(a.rawTime)));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
