"use client";

import { useEffect } from "react";
import { Employee } from "@/lib/api";

interface Props {
  employee: Employee;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmDialog({
  employee,
  busy,
  onCancel,
  onConfirm,
}: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="animate-fade-in absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={busy ? undefined : onCancel}
      />
      <div className="animate-slide-up relative w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <svg
            className="h-6 w-6 text-red-600"
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
        </div>
        <h3 className="text-center text-lg font-semibold text-slate-900">
          Delete employee?
        </h3>
        <p className="mt-2 text-center text-sm leading-relaxed text-slate-500">
          <span className="font-medium text-slate-700">{employee.name}</span>{" "}
          will be permanently removed from the database. This action cannot be
          undone.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            disabled={busy}
            className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:scale-[0.98] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-red-700 active:scale-[0.98] disabled:opacity-50"
          >
            {busy ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
