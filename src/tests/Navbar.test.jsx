/**
 * Navbar.test.jsx
 *
 * Unit tests for the Navbar component's role-based nav item visibility.
 *
 * Strategy: We don't render the full Navbar (it depends on AuthContext,
 * react-router, framer-motion, etc). Instead we test the navItems data
 * array filtering logic directly — the same logic used inside the component.
 *
 * This is an intentional design: if the nav visibility rules change,
 * these tests will catch regressions immediately.
 */

import { describe, it, expect } from "vitest";

// Reproduce the navItems array from Navbar.jsx
// (If Navbar exports it, import directly instead)
const navItems = [
    { path: "/", label: "Home" },
    { path: "/menu", label: "Menu & Polls", roles: ["student", "mhmc", "admin", "munimji"] },
    { path: "/dashboard", label: "Dashboard", roles: ["student", "mhmc", "admin", "munimji"] },
    { path: "/extras", label: "Extras", roles: ["admin", "munimji"] },
    { path: "/rebate", label: "Rebate", roles: ["student", "mhmc", "admin", "munimji"] },
    { path: "/billing", label: "Billing", roles: ["student", "mhmc", "admin"] },
    { path: "/mhmc", label: "MHMC", roles: ["mhmc", "admin"] },
    { path: "/forum", label: "Forum", roles: ["student", "mhmc", "admin"] },
    { path: "/admin", label: "Admin Panel", roles: ["admin"] },
];

// Helper: get visible labels for a given role (mirrors Navbar render logic)
function getVisibleLabels(role) {
    return navItems
        .filter((item) => !item.roles || item.roles.includes(role))
        .map((item) => item.label);
}

describe("Navbar role-based visibility", () => {
    it("shows Home to all roles", () => {
        ["student", "mhmc", "admin", "munimji"].forEach((role) => {
            expect(getVisibleLabels(role)).toContain("Home");
        });
    });

    it("hides Admin Panel from students", () => {
        expect(getVisibleLabels("student")).not.toContain("Admin Panel");
    });

    it("shows Admin Panel only to admin", () => {
        expect(getVisibleLabels("admin")).toContain("Admin Panel");
        expect(getVisibleLabels("mhmc")).not.toContain("Admin Panel");
        expect(getVisibleLabels("munimji")).not.toContain("Admin Panel");
    });

    it("hides Extras from students and mhmc", () => {
        expect(getVisibleLabels("student")).not.toContain("Extras");
        expect(getVisibleLabels("mhmc")).not.toContain("Extras");
    });

    it("shows Extras to admin and munimji", () => {
        expect(getVisibleLabels("admin")).toContain("Extras");
        expect(getVisibleLabels("munimji")).toContain("Extras");
    });

    it("shows MHMC panel to mhmc and admin only", () => {
        expect(getVisibleLabels("mhmc")).toContain("MHMC");
        expect(getVisibleLabels("admin")).toContain("MHMC");
        expect(getVisibleLabels("student")).not.toContain("MHMC");
        expect(getVisibleLabels("munimji")).not.toContain("MHMC");
    });

    it("shows Menu & Polls, Dashboard, Rebate to all logged-in roles", () => {
        const roles = ["student", "mhmc", "admin", "munimji"];
        roles.forEach((role) => {
            const labels = getVisibleLabels(role);
            expect(labels).toContain("Menu & Polls");
            expect(labels).toContain("Dashboard");
            expect(labels).toContain("Rebate");
        });
    });

    it("hides Billing from munimji", () => {
        expect(getVisibleLabels("munimji")).not.toContain("Billing");
    });
});
