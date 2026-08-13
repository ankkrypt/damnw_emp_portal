import { describe, it, expect } from "vitest";
import { displayName } from "./auth";

describe("displayName", () => {
  it("turns a dotted email into a capitalized name", () => {
    expect(displayName("john.doe@example.com")).toBe("John Doe");
  });

  it("handles underscores and hyphens as separators", () => {
    expect(displayName("mary_jane-smith@example.com")).toBe("Mary Jane Smith");
  });

  it("handles a single-word local part", () => {
    expect(displayName("alice@example.com")).toBe("Alice");
  });

  it("collapses repeated separators", () => {
    expect(displayName("john..doe@example.com")).toBe("John Doe");
  });

  it("capitalizes the first letter of each part but keeps the rest as-is", () => {
    expect(displayName("JOHN.DOE@example.com")).toBe("JOHN DOE");
  });

  it("falls back to 'User' when there is no local part", () => {
    expect(displayName("@example.com")).toBe("User");
  });
});
