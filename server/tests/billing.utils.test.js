/**
 * billing.utils.test.js
 *
 * Unit tests for the billing net-bill calculation logic.
 *
 * The formula lives in server/routes/billing.js (GET /api/billing/summary).
 * We extract it here as a pure function to test all edge cases without
 * touching the DB or Express.
 *
 * Formula:
 *   net_bill = base_fee + extras_total - rebate_total
 *   rebate_total = sum of (days_absent * daily_rate) for each approved rebate
 *   extras_total = sum of (price * quantity) for each extra purchase
 */

import { describe, it, expect } from "vitest";

// --- Pure calculation function (mirrors billing.js logic) ---
// When you refactor, move this to server/utils/billing.js and import it here.
function calculateNetBill({ baseFee, dailyRate, extras = [], rebates = [] }) {
    // Calculate rebate total
    const rebateTotal = rebates.reduce((sum, r) => {
        const from = new Date(r.from_date);
        const to = new Date(r.to_date);
        const days =
            Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;
        return sum + days * dailyRate;
    }, 0);

    // Calculate extras total
    const extrasTotal = extras.reduce(
        (sum, e) => sum + e.price * e.quantity,
        0
    );

    const netBill = baseFee + extrasTotal - rebateTotal;
    return { netBill, extrasTotal, rebateTotal };
}

// --- Tests ---

describe("calculateNetBill", () => {
    const BASE_FEE = 3000;
    const DAILY_RATE = 100;

    it("returns base fee when no extras or rebates", () => {
        const { netBill, extrasTotal, rebateTotal } = calculateNetBill({
            baseFee: BASE_FEE,
            dailyRate: DAILY_RATE,
        });
        expect(netBill).toBe(3000);
        expect(extrasTotal).toBe(0);
        expect(rebateTotal).toBe(0);
    });

    it("adds extra item costs to the base fee", () => {
        const extras = [
            { price: 30, quantity: 2 },  // ₹60
            { price: 50, quantity: 1 },  // ₹50
        ];
        const { netBill, extrasTotal } = calculateNetBill({
            baseFee: BASE_FEE,
            dailyRate: DAILY_RATE,
            extras,
        });
        expect(extrasTotal).toBe(110);
        expect(netBill).toBe(3110);
    });

    it("deducts rebate for a single 5-day absence", () => {
        const rebates = [
            { from_date: "2024-01-01", to_date: "2024-01-05" }, // 5 days
        ];
        const { netBill, rebateTotal } = calculateNetBill({
            baseFee: BASE_FEE,
            dailyRate: DAILY_RATE,
            rebates,
        });
        expect(rebateTotal).toBe(500); // 5 × ₹100
        expect(netBill).toBe(2500);
    });

    it("handles multiple rebates correctly", () => {
        const rebates = [
            { from_date: "2024-01-01", to_date: "2024-01-02" }, // 2 days
            { from_date: "2024-01-10", to_date: "2024-01-10" }, // 1 day
        ];
        const { rebateTotal } = calculateNetBill({
            baseFee: BASE_FEE,
            dailyRate: DAILY_RATE,
            rebates,
        });
        expect(rebateTotal).toBe(300); // (2 + 1) × ₹100
    });

    it("correctly nets extras and rebates together", () => {
        const extras = [{ price: 20, quantity: 5 }]; // ₹100
        const rebates = [
            { from_date: "2024-02-01", to_date: "2024-02-03" }, // 3 days = ₹300
        ];
        const { netBill } = calculateNetBill({
            baseFee: BASE_FEE,
            dailyRate: DAILY_RATE,
            extras,
            rebates,
        });
        // 3000 + 100 - 300 = 2800
        expect(netBill).toBe(2800);
    });

    it("can produce a bill less than zero (full rebate scenario)", () => {
        // Edge case: more rebate than the base fee
        const rebates = [
            { from_date: "2024-01-01", to_date: "2024-01-31" }, // 31 days
        ];
        const { netBill } = calculateNetBill({
            baseFee: 2000,
            dailyRate: DAILY_RATE,
            rebates,
        });
        // 2000 - 3100 = -1100
        expect(netBill).toBeLessThan(0);
    });
});
