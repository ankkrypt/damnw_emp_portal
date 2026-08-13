import { describe, it, expect } from "vitest";
import { hashColor, initials } from "./format";

describe("initials", () => {
  it("takes the first letter of the first two words", () => {
    expect(initials("John Doe")).toBe("JD");
  });

  it("returns a single initial for one-word names", () => {
    expect(initials("Cher")).toBe("C");
  });

  it("ignores words after the first two", () => {
    expect(initials("Mary Jane Watson")).toBe("MJ");
  });

  it("collapses multiple spaces", () => {
    expect(initials("  John   Doe  ")).toBe("JD");
  });

  it("uppercases lowercase input", () => {
    expect(initials("john doe")).toBe("JD");
  });

  it("handles an empty string", () => {
    expect(initials("")).toBe("");
  });
});

describe("hashColor", () => {
  const palette = ["red", "green", "blue"];

  it("always returns a color from the palette", () => {
    for (const name of ["John Doe", "Jane Smith", "Bob", "alice@x.com", ""]) {
      expect(palette).toContain(hashColor(name, palette));
    }
  });

  it("is deterministic: the same name always gets the same color", () => {
    expect(hashColor("John Doe", palette)).toBe(hashColor("John Doe", palette));
    expect(hashColor("Jane Smith", palette)).toBe(hashColor("Jane Smith", palette));
  });

  it("returns the first palette entry for an empty name", () => {
    // The hash starts at 0, so 0 % palette.length === 0.
    expect(hashColor("", palette)).toBe(palette[0]);
  });
});
