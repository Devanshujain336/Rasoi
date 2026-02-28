import express from "express";
import Rebate from "../models/Rebate.js";
import ExtraPurchase from "../models/ExtraPurchase.js";
import Profile from "../models/Profile.js";
import Hostel from "../models/Hostel.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

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

        // 3. Fetch extras
        const extras = await ExtraPurchase.find({ user_id: req.user._id });
        const extrasTotal = extras.reduce((sum, e) => sum + (e.price * e.quantity), 0);

        const netBill = baseMessFee + extrasTotal - totalRebateAmount;

        res.json({
            base_fee: baseMessFee,
            extras_total: extrasTotal,
            rebate_total: totalRebateAmount,
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
