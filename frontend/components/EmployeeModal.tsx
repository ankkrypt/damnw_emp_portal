"use client";

import { FormEvent, useEffect, useState } from "react";
import { Employee, EmployeeInput } from "@/lib/api";

interface Props {
  mode: "create" | "edit";
  employee?: Employee;
  departments: string[];
  positions: string[];
  busy: boolean;
  onClose: () => void;
  onSubmit: (input: EmployeeInput) => void;
}

interface FormState {
  name: string;
  email: string;
  position: string;
  department: string;
  salary: string;
  joinDate: string;
}

// Build a UTC-midnight ISO string from a "YYYY-MM-DD" date input so the
// stored date matches the date the user picked in every timezone.
const toISODate = (value: string): string => {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toISOString();
};

const toFormState = (e?: Employee): FormState => ({
  name: e?.name ?? "",
  email: e?.email ?? "",
  position: e?.position ?? "",
  department: e?.department ?? "",
  salary: e && e.salary ? String(e.salary) : "",
  joinDate: e?.joinDate ? e.joinDate.slice(0, 10) : "",
});

export default function EmployeeModal({
  mode,
  employee,
  departments,
  positions,
  busy,
  onClose,
  onSubmit,
}: Props) {
  // The parent remounts this modal (via `key`) whenever the target employee or
  // mode changes, so initializing from props here is always up to date.
  const [form, setForm] = useState<FormState>(() => toFormState(employee));
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onClose]);

  const set =
    (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    };

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) next.name = "Name is required";
    if (!form.email.trim()) next.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim()))
      next.email = "Enter a valid email address";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const salary = form.salary.trim() === "" ? 0 : Number(form.salary);
    onSubmit({
      name: form.name.trim(),
      email: form.email.trim(),
      position: form.position.trim(),
      department: form.department.trim(),
      salary: Number.isFinite(salary) ? salary : 0,
      joinDate: form.joinDate ? toISODate(form.joinDate) : undefined,
    });
  };

  const inputClass = (hasError?: string) =>
    `w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm outline-none transition focus:ring-2 ${
      hasError
        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
        : "border-slate-300 focus:border-indigo-400 focus:ring-indigo-100"
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="animate-fade-in absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={busy ? undefined : onClose}
      />
      <div className="animate-slide-up relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {mode === "create" ? "Add employee" : "Edit employee"}
          </h2>
          <button
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4 px-6 py-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Full name *
              </label>
              <input
                className={inputClass(errors.name)}
                value={form.name}
                onChange={set("name")}
                placeholder="e.g. Jane Smith"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600">{errors.name}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Email *
              </label>
              <input
                className={inputClass(errors.email)}
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="jane@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Position
              </label>
              <select
                className={inputClass()}
                value={form.position}
                onChange={set("position")}
              >
                <option value="">Select position…</option>
                {positions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Department
              </label>
              <select
                className={inputClass()}
                value={form.department}
                onChange={set("department")}
              >
                <option value="">Select department…</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Salary (USD)
              </label>
              <input
                className={inputClass()}
                type="number"
                min="0"
                value={form.salary}
                onChange={set("salary")}
                placeholder="e.g. 85000"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Join date
              </label>
              <input
                className={inputClass()}
                type="date"
                value={form.joinDate}
                onChange={set("joinDate")}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:scale-[0.98] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-60"
            >
              {busy
                ? "Saving…"
                : mode === "create"
                  ? "Add employee"
                  : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
