export interface Employee {
  _id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  salary: number;
  joinDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeInput {
  name: string;
  email: string;
  position?: string;
  department?: string;
  salary?: number;
  joinDate?: string;
}

const API_BASE = "/api/employees";

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message || `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export async function fetchEmployees(): Promise<{
  count: number;
  employees: Employee[];
}> {
  const res = await fetch(API_BASE);
  return handle(res);
}

export async function createEmployee(input: EmployeeInput): Promise<Employee> {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return handle<Employee>(res);
}

export async function updateEmployee(
  id: string,
  input: EmployeeInput
): Promise<Employee> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return handle<Employee>(res);
}

export async function deleteEmployee(id: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
  return handle(res);
}
