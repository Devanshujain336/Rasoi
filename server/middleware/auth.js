import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return res.status(401).json({ error: "Not authorized, no token" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select("-password");
        if (!req.user) return res.status(401).json({ error: "User not found" });
        next();
    } catch (err) {
        return res.status(401).json({ error: "Token invalid or expired" });
    }
};

export const requireRole = (...roles) => (req, res, next) => {
    if (!req.profile) return res.status(403).json({ error: "Profile not loaded" });
    if (!roles.includes(req.profile.role)) {
        return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
};
