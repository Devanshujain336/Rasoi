/**
 * auth.js
 * 
 * @description Express Router for Auth endpoints.
 * @usage Mount inside the main server/index.js file (e.g., app.use('/api/auth', router)).
 * @details Handles incoming HTTP requests, performs business logic using models, handles errors, and returns JSON responses. Routes are often protected via auth middleware.
 */

import express from "express";
import AllowedEmail from "../models/AllowedEmail.js";
import User from "../models/User.js";
import Profile from "../models/Profile.js";
import Hostel from "../models/Hostel.js";
import { protect } from "../middleware/auth.js";
import { z } from "zod";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";

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
            hostel: found.hostel_id ? { id: found.hostel_id._id, name: found.hostel_id.name, code: found.hostel_id.code } : null,
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
        if (existing) {
            if (existing.is_verified) {
                return res.status(409).json({ error: "An account with this email already exists." });
            } else {
                // Allow re-registration for unverified users: clear old attempt
                await Profile.deleteOne({ user_id: existing._id });
                await User.deleteOne({ _id: existing._id });
            }
        }

        const verificationToken = crypto.randomBytes(32).toString("hex");

        const user = await User.create({ 
            email: normalizedEmail, 
            password, 
            full_name,
            verification_token: verificationToken 
        });

        await Profile.create({
            user_id: user._id,
            hostel_id: allowedEntry.hostel_id ? allowedEntry.hostel_id._id : null,
            full_name: full_name || "",
            roll_number: roll_number || "",
            role: allowedEntry.role,
        });

        const verifyUrl = `${process.env.CLIENT_URL || "http://127.0.0.1:8080"}/verify-email?token=${verificationToken}`;
        const emailHtml = `
            <h2>Welcome to Rasoi! 👨‍🍳</h2>
            <p>Thank you for signing up. To complete your registration and activate your account, please verify your email address by clicking the link below:</p>
            <a href="${verifyUrl}" style="padding: 10px 20px; background-color: #fca311; color: white; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Verify My Email</a>
            <p style="margin-top: 20px; color: #666; font-size: 12px;">If you did not request this, please ignore this email.</p>
        `;

        await sendEmail({
            to: user.email,
            subject: "Verify Your Rasoi Account",
            html: emailHtml
        });

        res.status(201).json({ message: "Account created successfully. Please check your email to verify your account." });
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

        // If the user isn't verified but has a token, they are a new user who must verify.
        // Legacy users (created before this feature) will not have a verification_token.
        if (!user.is_verified && user.verification_token) {
            return res.status(403).json({ error: "Please verify your email before logging in. Check your inbox for the verification link." });
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

// POST /api/auth/verify-email
router.post("/verify-email", async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ error: "Verification token is required." });

        const user = await User.findOne({ verification_token: token });
        if (!user) {
            return res.status(400).json({ error: "Invalid or expired verification token." });
        }

        user.is_verified = true;
        user.verification_token = undefined;
        await user.save();

        res.json({ message: "Email verified successfully. You can now log in." });
    } catch (err) {
        console.error("VERIFY ERORR:", err);
        res.status(500).json({ error: "Internal server error during verification." });
    }
});

export default router;
