"use client";
import { Bell, Search } from "lucide-react";
import { usePathname } from "next/navigation";

const TITLES: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/patients": "Patients",
  "/dashboard/alerts": "Alerts",
  "/dashboard/audit": "Audit Log",
  "/dashboard/settings": "Settings",
};

export function TopBar() {
  const pathname = usePathname();
  const title = Object.entries(TITLES)
    .filter(([path]) => pathname.startsWith(path))
    .sort((a, b) => b[0].length - a[0].length)[0]?.[1] ?? "Dashboard";

  return (
    <header className="h-16 border-b border-slate-200 bg-white flex items-center px-6 gap-4 shrink-0">
      <h1 className="text-lg font-semibold text-slate-900">{title}</h1>

      <div className="ml-auto flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search patients…"
            className="pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50 w-52"
          />
        </div>

        {/* Alerts bell */}
        <button className="relative p-2 rounded-lg hover:bg-slate-50 transition-colors">
          <Bell className="w-5 h-5 text-slate-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-sm font-semibold">
          C
        </div>
      </div>
    </header>
  );
}
