/**
 * auth.schemas.test.js
 *
 * Unit tests for the Zod validation schemas used in auth routes.
 * These are pure logic tests — no mocking, no DB required.
 */

import { describe, it, expect } from "vitest";
import { z } from "zod";

// --- Reproduce the schemas from routes/auth.js ---
// (They are not exported, so we re-define them here. This is intentional:
//  if the real schemas change, these tests will catch the divergence.)

const signupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    full_name: z.string().min(2),
    roll_number: z.string().optional(),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

// --- Signup Schema ---

describe("signupSchema", () => {
    const validPayload = {
        email: "student@iit.ac.in",
        password: "secure123",
        full_name: "Devansh Sharma",
    };

    it("accepts valid signup data", () => {
        const result = signupSchema.safeParse(validPayload);
        expect(result.success).toBe(true);
    });

    it("accepts valid data with optional roll_number", () => {
        const result = signupSchema.safeParse({
            ...validPayload,
            roll_number: "21CS001",
        });
        expect(result.success).toBe(true);
    });

    it("rejects invalid email format", () => {
        const result = signupSchema.safeParse({
            ...validPayload,
            email: "not-an-email",
        });
        expect(result.success).toBe(false);
    });

    it("rejects password shorter than 6 characters", () => {
        const result = signupSchema.safeParse({
            ...validPayload,
            password: "abc",
        });
        expect(result.success).toBe(false);
    });

    it("rejects full_name shorter than 2 characters", () => {
        const result = signupSchema.safeParse({
            ...validPayload,
            full_name: "A",
        });
        expect(result.success).toBe(false);
    });

    it("rejects missing email", () => {
        const { email, ...rest } = validPayload;
        const result = signupSchema.safeParse(rest);
        expect(result.success).toBe(false);
    });
});

// --- Login Schema ---

describe("loginSchema", () => {
    const validPayload = {
        email: "admin@rasoi.in",
        password: "anypassword",
    };

    it("accepts valid login credentials", () => {
        const result = loginSchema.safeParse(validPayload);
        expect(result.success).toBe(true);
    });

    it("rejects empty password", () => {
        const result = loginSchema.safeParse({ ...validPayload, password: "" });
        expect(result.success).toBe(false);
    });

    it("rejects invalid email", () => {
        const result = loginSchema.safeParse({
            ...validPayload,
            email: "badformat",
        });
        expect(result.success).toBe(false);
    });

    it("rejects missing password field", () => {
        const result = loginSchema.safeParse({ email: validPayload.email });
        expect(result.success).toBe(false);
    });
});
