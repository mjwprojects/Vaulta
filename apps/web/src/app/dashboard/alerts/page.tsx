import type { Metadata } from "next";
import { AlertTriangle, Pill, Activity, Bell, CheckCircle } from "lucide-react";
import { cn, formatDate, formatTime, severityColor } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { AlertsActions } from "@/components/dashboard/AlertsActions";

export const metadata: Metadata = { title: "Alerts" };
export const dynamic = "force-dynamic";

const TYPE_ICON: Record<string, React.ElementType> = {
  emergency: AlertTriangle,
  medication_missed: Pill,
  vital_abnormal: Activity,
  check_in_missed: Bell,
  symptom_reported: Activity,
};

const STATUS_BADGE = {
  active:       "text-red-700 bg-red-50 border-red-200",
  acknowledged: "text-amber-700 bg-amber-50 border-amber-200",
  resolved:     "text-green-700 bg-green-50 border-green-200",
  dismissed:    "text-slate-500 bg-slate-50 border-slate-200",
};

export default async function AlertsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get consented patient IDs
  const { data: consents } = await supabase
    .from("caregiver_consents")
    .select("patient_id")
    .eq("caregiver_id", user?.id ?? "")
    .eq("status", "active");

  const patientIds = (consents ?? []).map((c: any) => c.patient_id);

  const { data: alertRows } = patientIds.length
    ? await supabase
        .from("alerts")
        .select("id, patient_id, type, severity, title, message, status, created_at, patients(profiles(full_name))")
        .in("patient_id", patientIds)
        .order("created_at", { ascending: false })
        .limit(100)
    : { data: [] };

  const alerts = (alertRows ?? []).map((a: any) => ({
    id: a.id,
    patient: a.patients?.profiles?.full_name ?? "Unknown",
    type: a.type as string,
    severity: a.severity as string,
    title: a.title as string,
    message: a.message as string,
    status: a.status as string,
    time: a.created_at as string,
  }));

  const active = alerts.filter((a) => a.status === "active");
  const rest = alerts.filter((a) => a.status !== "active");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <section>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Active ({active.length})
        </h2>
        {active.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-sm">
            No active alerts — all patients are stable.
          </div>
        ) : (
          <div className="space-y-3">
            {active.map((a) => <AlertCard key={a.id} alert={a} />)}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Past alerts ({rest.length})
        </h2>
        <div className="space-y-3">
          {rest.map((a) => <AlertCard key={a.id} alert={a} />)}
        </div>
      </section>
    </div>
  );
}

function AlertCard({ alert }: { alert: ReturnType<typeof Object.assign> }) {
  const Icon = TYPE_ICON[alert.type] ?? Bell;
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-start gap-4">
      <div className={cn("p-2.5 rounded-xl border shrink-0", severityColor(alert.severity))}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-slate-900 text-sm">{alert.patient}</span>
          <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border", STATUS_BADGE[alert.status as keyof typeof STATUS_BADGE])}>
            {alert.status}
          </span>
          <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border", severityColor(alert.severity))}>
            {alert.severity}
          </span>
        </div>
        <p className="font-medium text-slate-800 mt-1 text-sm">{alert.title}</p>
        <p className="text-slate-500 text-xs mt-0.5">{alert.message}</p>
        <p className="text-slate-400 text-xs mt-1">{formatDate(alert.time)} at {formatTime(alert.time)}</p>
      </div>
      {alert.status === "active" && <AlertsActions alertId={alert.id} />}
      {alert.status === "resolved" && (
        <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
      )}
    </div>
  );
}
