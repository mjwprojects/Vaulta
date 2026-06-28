import { LayoutDashboard, Users, Bell, ClipboardList } from "lucide-react";
import type { View } from "../App";

const NAV: { id: View; label: string; icon: React.ElementType; badge?: number }[] = [
  { id: "overview",  label: "Overview",  icon: LayoutDashboard },
  { id: "patients",  label: "Patients",  icon: Users },
  { id: "alerts",    label: "Alerts",    icon: Bell, badge: 3 },
  { id: "audit",     label: "Audit Log", icon: ClipboardList },
];

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

type Props = { active: View; onChange: (v: View) => void; alertCount?: number };

export function Sidebar({ active, onChange, alertCount = 0 }: Props) {
  return (
    <aside className="w-52 bg-white border-r border-slate-200 flex flex-col py-3 shrink-0">
      <nav className="flex-1 space-y-0.5 px-2">
        {NAV.map(({ id, label, icon: Icon }) => {
          const badge = id === "alerts" && alertCount > 0 ? alertCount : undefined;
          return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={cn(
              "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              active === id
                ? "bg-brand-50 text-brand-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <Icon className={cn("w-4 h-4", active === id ? "text-brand-600" : "text-slate-400")} />
            {label}
            {badge !== undefined && (
              <span className="ml-auto text-xs font-bold text-white bg-red-500 rounded-full w-4 h-4 flex items-center justify-center leading-none">
                {badge}
              </span>
            )}
          </button>
          );
        })}
      </nav>
    </aside>
  );
}
