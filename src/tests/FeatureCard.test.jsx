/**
 * FeatureCard.test.jsx
 *
 * Unit tests for the FeatureCard React component.
 * Verifies it correctly renders title and description props,
 * and applies the right gradient class based on the `gradient` prop.
 */

import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import FeatureCard from "../components/FeatureCard";

// framer-motion's motion components trigger animation APIs unavailable
// in jsdom. We stub it out so tests focus on rendered content only.
vi.mock("framer-motion", () => ({
    motion: {
        div: ({ children, className, ...rest }) => (
            <div className={className}>{children}</div>
        ),
    },
}));

// A minimal icon stub — FeatureCard just renders it inside a div
const MockIcon = () => <svg data-testid="feature-icon" />;

describe("FeatureCard", () => {
    it("renders the title prop", () => {
        render(
            <FeatureCard
                icon={MockIcon}
                title="Weekly Menu & Polls"
                description="View and vote on upcoming dishes."
            />
        );
        expect(
            screen.getByText("Weekly Menu & Polls")
        ).toBeInTheDocument();
    });

    it("renders the description prop", () => {
        render(
            <FeatureCard
                icon={MockIcon}
                title="Test Feature"
                description="This is a test description."
            />
        );
        expect(
            screen.getByText("This is a test description.")
        ).toBeInTheDocument();
    });

    it("renders the icon", () => {
        render(
            <FeatureCard
                icon={MockIcon}
                title="Test"
                description="Desc"
            />
        );
        expect(screen.getByTestId("feature-icon")).toBeInTheDocument();
    });

    it("applies warm gradient class by default", () => {
        const { container } = render(
            <FeatureCard icon={MockIcon} title="T" description="D" gradient="warm" />
        );
        // The icon wrapper div should have the warm gradient
        expect(container.querySelector(".bg-gradient-warm")).toBeTruthy();
    });

    it("applies emerald gradient class when gradient='emerald'", () => {
        const { container } = render(
            <FeatureCard icon={MockIcon} title="T" description="D" gradient="emerald" />
        );
        expect(container.querySelector(".bg-gradient-emerald")).toBeTruthy();
    });
});
