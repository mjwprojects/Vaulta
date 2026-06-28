import Link from "next/link";
import { cn, formatRelative } from "@/lib/utils";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";

type Patient = {
  id: string;
  name: string;
  condition: string;
  lastCheckIn: string | null;
  adherence: number;
  alerts: number;
  status: "critical" | "warning" | "stable";
};

const STATUS = {
  critical: { label: "Critical", icon: AlertTriangle, cls: "text-red-600 bg-red-50 border-red-200" },
  warning:  { label: "Attention", icon: Clock,         cls: "text-amber-600 bg-amber-50 border-amber-200" },
  stable:   { label: "Stable",   icon: CheckCircle,    cls: "text-green-600 bg-green-50 border-green-200" },
};

export function PatientList({ patients }: { patients: Patient[] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h2 className="font-semibold text-slate-900">My Patients</h2>
        <Link href="/dashboard/patients" className="text-xs font-medium text-brand-600 hover:text-brand-700">
          View all
        </Link>
      </div>

      <div className="divide-y divide-slate-100">
        {patients.map((p) => {
          const s = STATUS[p.status];
          const Icon = s.icon;
          return (
            <Link
              key={p.id}
              href={`/dashboard/patients/${p.id}`}
              className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors"
            >
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-semibold shrink-0">
                {p.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{p.name}</p>
                <p className="text-xs text-slate-400 truncate">{p.condition}</p>
              </div>

              {/* Adherence */}
              <div className="hidden sm:block text-right shrink-0">
                <p className="text-xs text-slate-500">Adherence</p>
                <p className={cn("text-sm font-semibold", p.adherence >= 90 ? "text-green-600" : p.adherence >= 75 ? "text-amber-600" : "text-red-600")}>
                  {p.adherence}%
                </p>
              </div>

              {/* Last check-in */}
              <div className="hidden md:block text-right shrink-0 w-20">
                <p className="text-xs text-slate-400">{p.lastCheckIn ? formatRelative(p.lastCheckIn) : "—"}</p>
              </div>

              {/* Status badge */}
              <div className={cn("flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-medium shrink-0", s.cls)}>
                <Icon className="w-3 h-3" />
                {s.label}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
