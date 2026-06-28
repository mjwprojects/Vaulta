"use client";
import { Bell, Search } from "lucide-react";
import { usePathname } from "next/navigation";

const TITLES: Record<string, string> = {
  "/dashboard":          "Overview",
  "/dashboard/patients": "Patients",
  "/dashboard/alerts":   "Alerts",
  "/dashboard/audit":    "Audit Log",
  "/dashboard/settings": "Settings",
};

export function TopBar() {
  const pathname = usePathname();
  const title = Object.entries(TITLES)
    .filter(([path]) => pathname.startsWith(path))
    .sort((a, b) => b[0].length - a[0].length)[0]?.[1] ?? "Dashboard";

  return (
    <header
      className="h-16 flex items-center px-6 gap-4 shrink-0"
      style={{ backgroundColor: "var(--surface)", borderBottom: "1px solid var(--border)" }}
    >
      <h1 className="text-base font-semibold" style={{ color: "var(--text)" }}>{title}</h1>

      <div className="ml-auto flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Search…"
            className="pl-9 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-1 w-48"
            style={{
              backgroundColor: "var(--surface-raised)",
              border: "1px solid var(--border)",
              color: "var(--text)",
            }}
          />
        </div>

        {/* Alerts bell */}
        <button
          className="relative p-2 rounded-lg transition-colors"
          style={{ color: "var(--text-muted)" }}
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
        </button>

        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
          style={{ background: "linear-gradient(135deg, #8E4DFF, #C084FC)", color: "#fff" }}
        >
          V
        </div>
      </div>
    </header>
  );
}
