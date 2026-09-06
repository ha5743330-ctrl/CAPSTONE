/**
 * components/chat/thinking-indicator.test.tsx
 * ------------------------------------------------------------------
 * Unit test for the ThinkingIndicator component: the placeholder
 * bubble shown between the user sending a message and the first
 * streamed token arriving.
 *
 * What we check:
 *  - It renders the same accessible label a screen reader user
 *    needs ("Assistant is thinking"), since the three animated dots
 *    convey nothing on their own without it.
 *  - It renders exactly three "dot" indicators (the animation cue).
 * ------------------------------------------------------------------
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { ThinkingIndicator } from "./thinking-indicator";

describe("ThinkingIndicator", () => {
  it("exposes an accessible label for screen reader users", () => {
    render(<ThinkingIndicator />);
    expect(screen.getByLabelText("Assistant is thinking")).toBeInTheDocument();
  });

  it("renders three animated dots", () => {
    const { container } = render(<ThinkingIndicator />);
    const dots = container.querySelectorAll(".animate-bounce");
    expect(dots).toHaveLength(3);
  });
});
