/**
 * auth.middleware.test.js
 *
 * Unit tests for the `protect` Express middleware (server/middleware/auth.js).
 *
 * Strategy: mock `jsonwebtoken` and mongoose's `User` model so these tests
 * run fully in-process — no database, no network required.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import jwt from "jsonwebtoken";
import { protect } from "../middleware/auth.js";

// --- Mocks ---

// Mock the User model so no Mongoose/DB is needed
vi.mock("../models/User.js", () => ({
    default: {
        findById: vi.fn(),
    },
}));

import User from "../models/User.js";

// Helper to build a fake Express req/res/next
const mockReqResNext = (authHeader) => {
    const req = {
        headers: authHeader ? { authorization: authHeader } : {},
    };
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
    };
    const next = vi.fn();
    return { req, res, next };
};

const TEST_SECRET = "test-secret";

describe("protect middleware", () => {
    beforeEach(() => {
        process.env.JWT_SECRET = TEST_SECRET;
        vi.clearAllMocks();
    });

    afterEach(() => {
        delete process.env.JWT_SECRET;
    });

    it("returns 401 when no Authorization header is present", async () => {
        const { req, res, next } = mockReqResNext(null);

        await protect(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ error: expect.any(String) })
        );
        expect(next).not.toHaveBeenCalled();
    });

    it("returns 401 when token is invalid / tampered", async () => {
        const { req, res, next } = mockReqResNext("Bearer invalid.token.here");

        await protect(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it("returns 401 when the decoded user no longer exists in DB", async () => {
        const validToken = jwt.sign({ id: "abc123" }, TEST_SECRET, {
            expiresIn: "1h",
        });
        // Simulate user deleted from DB
        User.findById.mockResolvedValueOnce(null);

        const { req, res, next } = mockReqResNext(`Bearer ${validToken}`);

        await protect(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it("calls next() and attaches user to req when token is valid", async () => {
        const fakeUser = { _id: "abc123", email: "student@iit.ac.in" };
        const validToken = jwt.sign({ id: fakeUser._id }, TEST_SECRET, {
            expiresIn: "1h",
        });
        User.findById.mockReturnValueOnce({
            select: vi.fn().mockResolvedValueOnce(fakeUser),
        });

        const { req, res, next } = mockReqResNext(`Bearer ${validToken}`);

        await protect(req, res, next);

        expect(next).toHaveBeenCalledOnce();
        expect(req.user).toBe(fakeUser);
        expect(res.status).not.toHaveBeenCalled();
    });
});
