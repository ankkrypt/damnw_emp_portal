import { describe, it, expect } from "vitest";
import { toFormState, toISODate } from "./EmployeeModal";
import type { Employee } from "@/lib/api";

describe("toISODate", () => {
  it("converts a YYYY-MM-DD input to a UTC-midnight ISO string", () => {
    expect(toISODate("2023-02-14")).toBe("2023-02-14T00:00:00.000Z");
  });

  it("never shifts the calendar date, regardless of timezone", () => {
    expect(toISODate("2021-03-15").slice(0, 10)).toBe("2021-03-15");
  });
});

describe("toFormState", () => {
  it("returns empty values when no employee is provided", () => {
    expect(toFormState()).toEqual({
      name: "",
      email: "",
      position: "",
      department: "",
      salary: "",
      joinDate: "",
    });
  });

  it("maps an employee into form state", () => {
    const employee: Employee = {
      _id: "1",
      name: "Jane Smith",
      email: "jane@example.com",
      position: "Product Manager",
      department: "Product",
      salary: 95000,
      joinDate: "2023-02-14T00:00:00.000Z",
      createdAt: "2023-02-14T00:00:00.000Z",
      updatedAt: "2023-02-14T00:00:00.000Z",
    };
    expect(toFormState(employee)).toEqual({
      name: "Jane Smith",
      email: "jane@example.com",
      position: "Product Manager",
      department: "Product",
      salary: "95000",
      joinDate: "2023-02-14",
    });
  });

  it("treats a zero salary as an empty field", () => {
    const employee: Employee = {
      _id: "1",
      name: "Jane Smith",
      email: "jane@example.com",
      position: "Product Manager",
      department: "Product",
      salary: 0,
      joinDate: "2023-02-14T00:00:00.000Z",
      createdAt: "2023-02-14T00:00:00.000Z",
      updatedAt: "2023-02-14T00:00:00.000Z",
    };
    expect(toFormState(employee).salary).toBe("");
  });
});
