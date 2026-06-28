import { cn, formatRelative, severityColor } from "@/lib/utils";
import { AlertTriangle, Pill, Activity, Bell } from "lucide-react";
import Link from "next/link";

type Alert = {
  id: string;
  patient: string;
  type: string;
  severity: string;
  message: string;
  time: string;
};

const TYPE_ICON: Record<string, React.ElementType> = {
  emergency: AlertTriangle,
  medication_missed: Pill,
  vital_abnormal: Activity,
  check_in_missed: Bell,
};

export function AlertsFeed({ alerts }: { alerts: Alert[] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h2 className="font-semibold text-slate-900">Active Alerts</h2>
        <Link
          href="/dashboard/alerts"
          className="text-xs font-medium text-brand-600 hover:text-brand-700"
        >
          View all
        </Link>
      </div>

      <div className="divide-y divide-slate-100 flex-1">
        {alerts.map((alert) => {
          const Icon = TYPE_ICON[alert.type] ?? Bell;
          return (
            <div key={alert.id} className="flex items-start gap-3 px-5 py-4">
              <div className={cn("p-1.5 rounded-lg border mt-0.5 shrink-0", severityColor(alert.severity))}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{alert.patient}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{alert.message}</p>
              </div>
              <span className="text-xs text-slate-400 shrink-0 mt-0.5">{formatRelative(alert.time)}</span>
            </div>
          );
        })}
      </div>

      <div className="px-5 py-3 border-t border-slate-100">
        <Link
          href="/dashboard/alerts"
          className="block w-full text-center text-sm font-medium text-brand-600 hover:text-brand-700 py-1"
        >
          Manage alerts →
        </Link>
      </div>
    </div>
  );
}
