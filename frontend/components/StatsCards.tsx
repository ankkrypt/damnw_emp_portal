"use client";

import { Employee } from "@/lib/api";

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

interface Props {
  employees: Employee[];
  loading: boolean;
}

const peopleIcon = (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
    />
  </svg>
);

const cashIcon = (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"
    />
  </svg>
);

const officeIcon = (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
    />
  </svg>
);

const sparkleIcon = (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
    />
  </svg>
);

export default function StatsCards({ employees, loading }: Props) {
  const total = employees.length;
  const avgSalary = total
    ? employees.reduce((sum, e) => sum + (e.salary || 0), 0) / total
    : 0;
  const departments = new Set(
    employees.map((e) => e.department).filter(Boolean)
  ).size;
  const newest = total
    ? [...employees].sort(
        (a, b) =>
          +new Date(b.joinDate || b.createdAt) -
          +new Date(a.joinDate || a.createdAt)
      )[0]
    : null;

  const cards = [
    {
      label: "Total employees",
      value: String(total),
      sub: `${new Set(employees.map((e) => e.position).filter(Boolean)).size} unique roles`,
      icon: peopleIcon,
      tint: "bg-indigo-50 text-indigo-600",
    },
    {
      label: "Average salary",
      value: usd.format(avgSalary),
      sub: "across all employees",
      icon: cashIcon,
      tint: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Departments",
      value: String(departments),
      sub: "active departments",
      icon: officeIcon,
      tint: "bg-violet-50 text-violet-600",
    },
    {
      label: "Newest hire",
      value: newest ? newest.name.split(" ")[0] : "—",
      sub: newest ? fmtDate.format(new Date(newest.joinDate)) : "no employees yet",
      icon: sparkleIcon,
      tint: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {card.label}
              </p>
              {loading ? (
                <div className="skeleton mt-2 h-7 w-24 rounded-md" />
              ) : (
                <p className="mt-1 truncate text-2xl font-bold text-slate-900">
                  {card.value}
                </p>
              )}
              <p className="mt-1 text-xs text-slate-500">{card.sub}</p>
            </div>
            <div
              className={`flex h-10 w-10 flex-none items-center justify-center rounded-xl ${card.tint} transition-transform duration-200 group-hover:scale-110`}
            >
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
