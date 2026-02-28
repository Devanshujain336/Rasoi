import express from "express";
import AllowedEmail from "../models/AllowedEmail.js";
import User from "../models/User.js";
import Profile from "../models/Profile.js";
import Hostel from "../models/Hostel.js";
import { protect } from "../middleware/auth.js";
import { z } from "zod";

const router = express.Router();

const signupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    full_name: z.string().min(2),
    roll_number: z.string().optional()
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1)
});

// POST /api/auth/validate-email
router.post("/validate-email", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ allowed: false, error: "Email is required." });

        const found = await AllowedEmail.findOne({ email: email.toLowerCase().trim() }).populate("hostel_id");
        if (!found) return res.json({ allowed: false, error: "This email is not on the approved list. Contact your hostel admin." });

        return res.json({
            allowed: true,
            role: found.role,
            hostel: { id: found.hostel_id._id, name: found.hostel_id.name, code: found.hostel_id.code },
        });
    } catch (err) {
        res.status(500).json({ allowed: false, error: "Server error." });
    }
});

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
    try {
        const validation = signupSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ error: validation.error.errors[0].message });
        }

        const { email, password, full_name, roll_number } = validation.data;
        const normalizedEmail = email.toLowerCase().trim();

        const allowedEntry = await AllowedEmail.findOne({ email: normalizedEmail }).populate("hostel_id");
        if (!allowedEntry) return res.status(403).json({ error: "Email not on approved list." });

        const existing = await User.findOne({ email: normalizedEmail });
        if (existing) return res.status(409).json({ error: "An account with this email already exists." });

        const user = await User.create({ email: normalizedEmail, password, full_name });

        await Profile.create({
            user_id: user._id,
            hostel_id: allowedEntry.hostel_id._id,
            full_name: full_name || "",
            roll_number: roll_number || "",
            role: allowedEntry.role,
        });

        const token = user.generateToken();
        res.status(201).json({ message: "Account created successfully.", token, userId: user._id });
    } catch (err) {
        console.error("SIGNUP ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
    try {
        const validation = loginSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ error: validation.error.errors[0].message });
        }

        const { email, password } = validation.data;
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        const token = user.generateToken();
        res.json({ token, userId: user._id, email: user.email });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/auth/me  (requires auth)
router.get("/me", protect, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user_id: req.user._id }).populate("hostel_id");
        console.log(`🔍 Serving /me for ${req.user.email}. Role: ${profile?.role}`);
        res.json({
            user: {
                id: req.user._id,
                email: req.user.email,
                created_at: req.user.created_at,
            },
            profile: profile || null,
            role: profile?.role || "student",
            hostel: profile?.hostel_id || null,
            isBlocked: profile?.is_blocked || false,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
