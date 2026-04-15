/**
 * auth.js
 * 
 * @description Express Middleware function.
 * @usage Pass as one of the handler arguments in route definitions (e.g. router.get("/route", middleware, handler)).
 * @details Interprets incoming request parameters or headers (like JWT tokens) to authenticate users or restrict access.
 */

import jwt from "jsonwebtoken";
import User from "../models/User.js";

// security guard checking the id 
export const protect = async (req, res, next) => {
    let token;
    // jwt has 3 parts header-payload-signature, here we extracts bearer < token > from header
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return res.status(401).json({ error: "Not authorized, no token" });
    }

    // verify the token using jwt.verify and extract the user id from payload
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); 
        req.user = await User.findById(decoded.id).select("-password"); // select("-password") is used to exclude the password from the user object
        if (!req.user) return res.status(401).json({ error: "User not found" });
        next(); // if everything is fine, call next() to proceed to the next middleware or route handler
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
