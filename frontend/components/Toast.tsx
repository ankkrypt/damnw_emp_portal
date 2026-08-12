"use client";

export interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

export default function Toasts({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed bottom-5 right-5 z-[60] flex w-80 max-w-[calc(100vw-2.5rem)] flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className={`animate-toast-in flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-md ${
            toast.type === "success"
              ? "border-emerald-200 bg-emerald-50/95 text-emerald-900"
              : "border-red-200 bg-red-50/95 text-red-900"
          }`}
        >
          <span
            className={`mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-white text-[11px] font-bold shadow-sm ${
              toast.type === "success" ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {toast.type === "success" ? "✓" : "✕"}
          </span>
          <p className="text-sm font-medium leading-snug">{toast.message}</p>
        </div>
      ))}
    </div>
  );
}
