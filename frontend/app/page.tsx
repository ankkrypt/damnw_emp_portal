"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Employee,
  EmployeeInput,
  fetchEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "@/lib/api";
import { getSession, logout, useSession } from "@/lib/auth";
import { matchesDepartment, matchesSearch } from "@/lib/filters";
import { hashColor, initials } from "@/lib/format";
import EmployeeModal from "@/components/EmployeeModal";
import ConfirmDialog from "@/components/ConfirmDialog";
import Toasts, { Toast } from "@/components/Toast";

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const fmtDate = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const AVATAR_COLORS = [
  "bg-indigo-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-violet-500",
  "bg-sky-500",
  "bg-teal-500",
  "bg-fuchsia-500",
];

const DEPT_PALETTE = [
  "bg-sky-50 text-sky-700 ring-sky-200",
  "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "bg-violet-50 text-violet-700 ring-violet-200",
  "bg-amber-50 text-amber-700 ring-amber-200",
  "bg-rose-50 text-rose-700 ring-rose-200",
  "bg-teal-50 text-teal-700 ring-teal-200",
  "bg-indigo-50 text-indigo-700 ring-indigo-200",
  "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200",
];

// Dropdown options for the add/edit employee modal. Edit these lists to change
// the choices shown in the Position and Department dropdowns.
const DEPARTMENTS = [
  "Engineering",
  "Product",
  "Design",
  "Human Resources",
  "Data",
];

const POSITIONS = [
  "Software Engineer",
  "Product Manager",
  "UI/UX Designer",
  "DevOps Engineer",
  "HR Manager",
  "Data Analyst",
];

const avatarColor = (name: string) => hashColor(name, AVATAR_COLORS);
const deptColor = (dept: string) => hashColor(dept || "?", DEPT_PALETTE);

type ModalState =
  | { mode: "create" }
  | { mode: "edit"; employee: Employee }
  | null;

export default function Home() {
  const router = useRouter();
  const session = useSession();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("all");
  const [modal, setModal] = useState<ModalState>(null);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [reloadKey, setReloadKey] = useState(0);

  // Gate the page behind the demo login. useSession() returns null on the
  // server and during the initial hydration render (its server snapshot is
  // () => null) even for signed-in users, so compare against the real store
  // value (getSession) before redirecting. Otherwise every page load
  // "bounces" to /auth/login and straight back, remounting this page and
  // firing a second fetch to /api/employees.
  useEffect(() => {
    if (session === null && getSession() === null) {
      router.replace("/auth/login");
    }
  }, [session, router]);

  const handleLogout = () => {
    logout();
    router.replace("/auth/login");
  };

  const notify = useCallback(
    (message: string, type: Toast["type"] = "success") => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  useEffect(() => {
    // Don't fetch until the session has resolved (it's null during the initial
    // hydration render even for signed-in users). This also prevents a request
    // from firing while the page is mid-redirect to /auth/login.
    if (!session) return;
    let active = true;
    fetchEmployees()
      .then((data) => {
        if (!active) return;
        setEmployees(data.employees);
        setError(null);
      })
      .catch((e) => {
        if (!active) return;
        setError(e instanceof Error ? e.message : "Failed to load employees");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [session, reloadKey]);

  const retry = () => {
    setLoading(true);
    setError(null);
    setReloadKey((k) => k + 1);
  };

  const filterDepartments = useMemo(
    () =>
      Array.from(
        new Set(employees.map((e) => e.department).filter(Boolean))
      ).sort(),
    [employees]
  );

  const filtered = useMemo(
    () =>
      employees.filter(
        (e) => matchesDepartment(e, department) && matchesSearch(e, search)
      ),
    [employees, search, department]
  );

  const handleSubmit = async (input: EmployeeInput) => {
    if (!modal) return;
    setSaving(true);
    try {
      if (modal.mode === "edit") {
        const updated = await updateEmployee(modal.employee._id, input);
        setEmployees((prev) => [
          updated,
          ...prev.filter((e) => e._id !== updated._id),
        ]);
        notify(`${updated.name} updated`);
      } else {
        const created = await createEmployee(input);
        setEmployees((prev) => [created, ...prev]);
        notify(`${created.name} added`);
      }
      setModal(null);
    } catch (e) {
      notify(e instanceof Error ? e.message : "Something went wrong", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-500" />
          <p className="text-sm text-slate-400">Checking session…</p>
        </div>
      </main>
    );
  }

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await deleteEmployee(deleteTarget._id);
      setEmployees((prev) => prev.filter((e) => e._id !== deleteTarget._id));
      notify(`${deleteTarget.name} removed`);
      setDeleteTarget(null);
    } catch (e) {
      notify(e instanceof Error ? e.message : "Something went wrong", "error");
      setDeleteTarget(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen">
      {/* ---------- Header ---------- */}
      <header className="relative overflow-hidden bg-slate-950">
        <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-indigo-600/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-5 py-8 sm:px-8 sm:py-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-900/40">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                  Employee Portal
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="hidden items-center gap-2 md:flex">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white shadow-md shadow-indigo-900/40">
                  {session.name
                    .split(/\s+/)
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </div>
                <span className="max-w-[9rem] truncate text-xs text-slate-300">
                  {session.name}
                </span>
              </div>
              <span
                title={error ? "API unreachable" : "API connected"}
                className={`inline-flex items-center rounded-full border p-1.5 text-xs font-medium sm:gap-2 sm:px-3 sm:py-1.5 ${
                  error
                    ? "border-red-400/30 bg-red-500/10 text-red-300"
                    : "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    error ? "bg-red-400" : "bg-emerald-400 animate-pulse-dot"
                  }`}
                />
                <span className="hidden sm:inline">
                  {error ? "API unreachable" : "API connected"}
                </span>
              </span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white active:scale-[0.97]"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
                  />
                </svg>
                Log out
              </button>
              <button
                onClick={() => setModal({ mode: "create" })}
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-slate-900/30 transition hover:bg-indigo-50 hover:text-indigo-700 active:scale-[0.97] sm:px-4"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
                Add employee
              </button>
            </div>
          </div>

          {/* ---------- Error banner ---------- */}
          {error && (
            <div className="animate-fade-in flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-400/30 bg-red-500/10 px-5 py-4 text-sm text-red-200">
              <div className="flex items-center gap-3">
                <svg
                  className="h-5 w-5 flex-none text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                  />
                </svg>
                <p>
                  Could not reach the API — make sure the backend is running on{" "}
                  <code className="rounded bg-slate-900/60 px-1.5 py-0.5 font-mono text-xs text-red-100">
                    localhost:5000
                  </code>
                  . {error}
                </p>
              </div>
              <button
                onClick={retry}
                className="rounded-lg border border-red-400/40 px-3.5 py-1.5 text-xs font-semibold text-red-100 transition hover:bg-red-500/20 active:scale-[0.97]"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ---------- Content ---------- */}
      <div className="mx-auto max-w-6xl space-y-6 px-5 py-8 sm:px-8">

        {/* ---------- Toolbar ---------- */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <svg
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, position, department…"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="all">All departments</option>
            {filterDepartments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <p className="text-sm text-slate-500 sm:text-right">
            {loading ? (
              "Loading…"
            ) : (
              <>
                Showing{" "}
                <span className="font-semibold text-slate-800">
                  {filtered.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-800">
                  {employees.length}
                </span>
              </>
            )}
          </p>
        </div>

        {/* ---------- Table ---------- */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-xs uppercase tracking-wider text-slate-400">
                  <th className="px-5 py-3.5 font-semibold">Employee</th>
                  <th className="px-5 py-3.5 font-semibold">Department</th>
                  <th className="px-5 py-3.5 font-semibold">Position</th>
                  <th className="px-5 py-3.5 font-semibold">Salary</th>
                  <th className="px-5 py-3.5 font-semibold">Joined</th>
                  <th className="px-5 py-3.5 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i} className="border-b border-slate-50">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="skeleton h-10 w-10 rounded-full" />
                            <div className="space-y-1.5">
                              <div className="skeleton h-3.5 w-32 rounded" />
                              <div className="skeleton h-3 w-40 rounded" />
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="skeleton h-5 w-20 rounded-full" />
                        </td>
                        <td className="px-5 py-4">
                          <div className="skeleton h-3.5 w-28 rounded" />
                        </td>
                        <td className="px-5 py-4">
                          <div className="skeleton h-3.5 w-16 rounded" />
                        </td>
                        <td className="px-5 py-4">
                          <div className="skeleton h-3.5 w-20 rounded" />
                        </td>
                        <td className="px-5 py-4">
                          <div className="skeleton ml-auto h-5 w-16 rounded" />
                        </td>
                      </tr>
                    ))
                  : filtered.map((emp) => (
                      <tr
                        key={emp._id}
                        className="group border-b border-slate-50 transition-colors last:border-0 hover:bg-indigo-50/40"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-10 w-10 flex-none items-center justify-center rounded-full text-sm font-bold text-white shadow-sm ${avatarColor(emp.name)}`}
                            >
                              {initials(emp.name)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900">
                                {emp.name}
                              </p>
                              <p className="truncate text-xs text-slate-500">
                                {emp.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          {emp.department ? (
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${deptColor(emp.department)}`}
                            >
                              {emp.department}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-slate-700">
                          {emp.position || (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4 font-medium text-slate-800">
                          {usd.format(emp.salary || 0)}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {emp.joinDate
                            ? fmtDate.format(new Date(emp.joinDate))
                            : "—"}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                            <button
                              onClick={() =>
                                setModal({ mode: "edit", employee: emp })
                              }
                              aria-label={`Edit ${emp.name}`}
                              title="Edit"
                              className="rounded-lg p-2 text-slate-400 transition hover:bg-indigo-100 hover:text-indigo-600 active:scale-95"
                            >
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.9}
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => setDeleteTarget(emp)}
                              aria-label={`Delete ${emp.name}`}
                              title="Delete"
                              className="rounded-lg p-2 text-slate-400 transition hover:bg-red-100 hover:text-red-600 active:scale-95"
                            >
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.9}
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          {!loading && filtered.length === 0 && (
            <div className="animate-fade-in flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                <svg
                  className="h-7 w-7 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.6}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">
                {employees.length === 0
                  ? "No employees yet"
                  : "No matches found"}
              </h3>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                {employees.length === 0
                  ? "Add your first employee to start building your team directory."
                  : "Try adjusting your search or clearing the department filter."}
              </p>
              {(search || department !== "all") && (
                <button
                  onClick={() => {
                    setSearch("");
                    setDepartment("all");
                  }}
                  className="mt-4 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:scale-[0.98]"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ---------- Overlays ---------- */}
      {modal && (
        <EmployeeModal
          key={modal.mode === "edit" ? modal.employee._id : "create"}
          mode={modal.mode}
          employee={modal.mode === "edit" ? modal.employee : undefined}
          departments={DEPARTMENTS}
          positions={POSITIONS}
          busy={saving}
          onClose={() => {
            if (!saving) setModal(null);
          }}
          onSubmit={handleSubmit}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          employee={deleteTarget}
          busy={saving}
          onCancel={() => {
            if (!saving) setDeleteTarget(null);
          }}
          onConfirm={handleDelete}
        />
      )}

      <Toasts toasts={toasts} />
    </main>
  );
}
