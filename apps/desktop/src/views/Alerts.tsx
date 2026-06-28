import { AlertTriangle, Pill, Activity, Bell, CheckCircle } from "lucide-react";
import { supabase } from "../lib/supabase";
import type { AlertRow } from "../lib/useSupabaseData";

function cn(...c: (string | boolean | undefined)[]) { return c.filter(Boolean).join(" "); }

const TYPE_ICON: Record<string, React.ElementType> = {
  emergency: AlertTriangle,
  medication_missed: Pill,
  vital_abnormal: Activity,
  check_in_missed: Bell,
  symptom_reported: Activity,
};

const SEV: Record<string, string> = {
  critical: "text-red-600 bg-red-50 border-red-200",
  high:     "text-orange-600 bg-orange-50 border-orange-200",
  medium:   "text-amber-600 bg-amber-50 border-amber-200",
  low:      "text-blue-600 bg-blue-50 border-blue-200",
};

const STATUS_BADGE: Record<string, string> = {
  active:       "text-red-700 bg-red-50 border-red-200",
  acknowledged: "text-amber-700 bg-amber-50 border-amber-200",
  resolved:     "text-green-700 bg-green-50 border-green-200",
  dismissed:    "text-slate-500 bg-slate-50 border-slate-200",
};

type Props = { alerts: AlertRow[]; loading: boolean; onRefresh: () => void };

export function Alerts({ alerts, loading, onRefresh }: Props) {
  const active = alerts.filter((a) => a.status === "active");
  const rest = alerts.filter((a) => a.status !== "active");

  async function updateAlert(id: string, status: "acknowledged" | "resolved") {
    await supabase.from("alerts").update({ status }).eq("id", id);
    onRefresh();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-5">
      <section>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Active ({active.length})
        </p>
        {active.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-sm">
            No active alerts — all patients stable.
          </div>
        ) : (
          <div className="space-y-2">
            {active.map((a) => <AlertCard key={a.id} alert={a} onUpdate={updateAlert} />)}
          </div>
        )}
      </section>

      <section>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Past alerts ({rest.length})
        </p>
        <div className="space-y-2">
          {rest.map((a) => <AlertCard key={a.id} alert={a} onUpdate={updateAlert} />)}
        </div>
      </section>
    </div>
  );
}

function AlertCard({ alert: a, onUpdate }: { alert: AlertRow; onUpdate: (id: string, status: "acknowledged" | "resolved") => void }) {
  const Icon = TYPE_ICON[a.type] ?? Bell;
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-start gap-3">
      <div className={cn("p-2 rounded-xl border shrink-0", SEV[a.severity])}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-slate-900 text-sm">{a.patient}</span>
          <span className={cn("text-xs px-2 py-0.5 rounded-full border", STATUS_BADGE[a.status])}>
            {a.status}
          </span>
          <span className={cn("text-xs px-2 py-0.5 rounded-full border", SEV[a.severity])}>
            {a.severity}
          </span>
        </div>
        <p className="font-medium text-slate-800 mt-1 text-xs">{a.title}</p>
        <p className="text-slate-500 text-xs mt-0.5">{a.message}</p>
      </div>
      {a.status === "active" && (
        <div className="flex flex-col gap-1.5 shrink-0">
          <button
            onClick={() => onUpdate(a.id, "acknowledged")}
            className="px-2.5 py-1 rounded-lg bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 transition-colors"
          >
            Acknowledge
          </button>
          <button
            onClick={() => onUpdate(a.id, "resolved")}
            className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 text-xs hover:bg-slate-50 transition-colors"
          >
            Resolve
          </button>
        </div>
      )}
      {a.status === "resolved" && <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />}
    </div>
  );
}
