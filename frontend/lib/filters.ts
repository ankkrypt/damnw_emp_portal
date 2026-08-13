import { Employee } from "@/lib/api";

/**
 * Case-insensitive substring match across name, email, position, and department.
 * An empty/whitespace-only query matches everything.
 */
export function matchesSearch(employee: Employee, query: string): boolean {
  const q = query.trim().toLowerCase();
  return (
    !q ||
    employee.name.toLowerCase().includes(q) ||
    employee.email.toLowerCase().includes(q) ||
    employee.position.toLowerCase().includes(q) ||
    employee.department.toLowerCase().includes(q)
  );
}

/**
 * Exact-match department filter. "all" (or any empty value) matches every
 * employee; anything else must equal the employee's department exactly.
 */
export function matchesDepartment(
  employee: Employee,
  department: string
): boolean {
  return department === "all" || employee.department === department;
}
