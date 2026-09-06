/**
 * lib/streaming-markdown.test.ts
 * ------------------------------------------------------------------
 * Unit tests for balanceMarkdown().
 *
 * Why this function specifically: it's the piece that keeps the
 * streaming chat UI from visually breaking (unclosed code fences,
 * dangling bold markers) while tokens are still arriving. It's a
 * pure function with no React/DOM dependency, so it's the cheapest,
 * highest-signal place to start test coverage for this app.
 * ------------------------------------------------------------------
 */
import { describe, it, expect } from "vitest";
import { balanceMarkdown } from "./streaming-markdown";

describe("balanceMarkdown", () => {
  it("returns plain text unchanged", () => {
    expect(balanceMarkdown("Hello there")).toBe("Hello there");
  });

  it("closes an unclosed triple-backtick code fence", () => {
    const input = "Here is some code:\n```js\nconst x = 1;";
    expect(balanceMarkdown(input)).toBe(input + "\n```");
  });

  it("leaves a balanced code fence untouched", () => {
    const input = "```js\nconst x = 1;\n```";
    expect(balanceMarkdown(input)).toBe(input);
  });

  it("closes an unclosed inline code span", () => {
    const input = "Run `npm install";
    expect(balanceMarkdown(input)).toBe(input + "`");
  });

  it("leaves a balanced inline code span untouched", () => {
    const input = "Run `npm install` first";
    expect(balanceMarkdown(input)).toBe(input);
  });

  it("closes unclosed bold markers", () => {
    const input = "This is **important";
    expect(balanceMarkdown(input)).toBe(input + "**");
  });

  it("leaves balanced bold markers untouched", () => {
    const input = "This is **important** text";
    expect(balanceMarkdown(input)).toBe(input);
  });

  it("handles multiple unbalanced constructs in one chunk", () => {
    const input = "**Bold and `code";
    const result = balanceMarkdown(input);
    // Both the inline code span and the bold marker should be closed.
    expect(result).toBe("**Bold and `code`**");
  });

  it("returns an empty string unchanged", () => {
    expect(balanceMarkdown("")).toBe("");
  });
});
