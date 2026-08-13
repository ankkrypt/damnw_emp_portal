import { describe, it, expect } from "vitest";
import { matchesDepartment, matchesSearch } from "./filters";
import type { Employee } from "./api";

const jane: Employee = {
  _id: "1",
  name: "Jane Smith",
  email: "jane.smith@example.com",
  position: "Product Manager",
  department: "Product",
  salary: 95000,
  joinDate: "2020-07-01T00:00:00.000Z",
  createdAt: "2020-07-01T00:00:00.000Z",
  updatedAt: "2020-07-01T00:00:00.000Z",
};

// An employee created without position/department — the schema stores "".
const minimal: Employee = {
  _id: "2",
  name: "Ada Lovelace",
  email: "ada@example.com",
  position: "",
  department: "",
  salary: 0,
  joinDate: "2023-02-14T00:00:00.000Z",
  createdAt: "2023-02-14T00:00:00.000Z",
  updatedAt: "2023-02-14T00:00:00.000Z",
};

describe("matchesSearch", () => {
  it("matches an empty query", () => {
    expect(matchesSearch(jane, "")).toBe(true);
  });

  it("matches a whitespace-only query", () => {
    expect(matchesSearch(jane, "   ")).toBe(true);
  });

  it("matches by name (case-insensitive)", () => {
    expect(matchesSearch(jane, "jane")).toBe(true);
    expect(matchesSearch(jane, "JANE SMITH")).toBe(true);
  });

  it("matches by email substring", () => {
    expect(matchesSearch(jane, "example.com")).toBe(true);
  });

  it("matches by position", () => {
    expect(matchesSearch(jane, "product manager")).toBe(true);
  });

  it("matches by department", () => {
    expect(matchesSearch(jane, "product")).toBe(true);
  });

  it("matches partial words (substring, not whole word)", () => {
    expect(matchesSearch(jane, "an")).toBe(true); // "J**an**e"
  });

  it("does not match unrelated text", () => {
    expect(matchesSearch(jane, "zebra")).toBe(false);
  });

  it("requires the whole query to appear contiguously (no word reordering)", () => {
    expect(matchesSearch(jane, "smith jane")).toBe(false);
  });

  it("handles employees with empty position/department without crashing", () => {
    expect(matchesSearch(minimal, "engineering")).toBe(false);
    expect(matchesSearch(minimal, "ada")).toBe(true);
    expect(matchesSearch(minimal, "lovelace")).toBe(true);
  });
});

describe("matchesDepartment", () => {
  it("matches everyone when the filter is 'all'", () => {
    expect(matchesDepartment(jane, "all")).toBe(true);
    expect(matchesDepartment(minimal, "all")).toBe(true);
  });

  it("matches an exact department", () => {
    expect(matchesDepartment(jane, "Product")).toBe(true);
  });

  it("does not match a different department", () => {
    expect(matchesDepartment(jane, "Engineering")).toBe(false);
  });

  it("is case-sensitive (exact match)", () => {
    expect(matchesDepartment(jane, "product")).toBe(false);
  });

  it("matches employees with an empty department when the filter is empty", () => {
    expect(matchesDepartment(minimal, "")).toBe(true);
    expect(matchesDepartment(jane, "")).toBe(false);
  });
});
