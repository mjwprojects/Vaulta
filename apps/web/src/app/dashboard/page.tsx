import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/dashboard/StatCard";
import { AlertsFeed } from "@/components/dashboard/AlertsFeed";
import { PatientList } from "@/components/dashboard/PatientList";
import { VitalsChart } from "@/components/dashboard/VitalsChart";
import { Users, Bell, ShieldCheck, Activity } from "lucide-react";

export const metadata: Metadata = { title: "Overview" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const uid = user?.id ?? "";

  // Step 1 — consented patient IDs
  const { data: consents } = await supabase
    .from("caregiver_consents")
    .select("patient_id")
    .eq("caregiver_id", uid)
    .eq("status", "active");

  const patientIds = (consents ?? []).map((c: any) => c.patient_id as string);

  const today = new Date().toISOString().split("T")[0];

  const [patientRows, alertRows, medLogs, checkins] = await Promise.all([
    patientIds.length
      ? (supabase as any).from("patients").select("id, primary_condition, profile_id").in("id", patientIds).then((r: any) => r.data ?? [])
      : Promise.resolve([]),
    patientIds.length
      ? (supabase as any).from("alerts").select("id, patient_id, type, severity, title, message, created_at").in("patient_id", patientIds).eq("status", "active").order("created_at", { ascending: false }).limit(20).then((r: any) => r.data ?? [])
      : Promise.resolve([]),
    patientIds.length
      ? (supabase as any).from("medication_logs").select("patient_id, status").in("patient_id", patientIds).gte("scheduled_at", `${today}T00:00:00Z`).then((r: any) => r.data ?? [])
      : Promise.resolve([]),
    patientIds.length
      ? (supabase as any).from("health_records").select("patient_id").in("patient_id", patientIds).gte("recorded_at", `${today}T00:00:00Z`).then((r: any) => r.data ?? [])
      : Promise.resolve([]),
  ]) as [any[], any[], any[], any[]];

  // Build lookup maps
  const alertCountMap: Record<string, number> = {};
  const hasCritical: Record<string, boolean> = {};
  for (const a of alertRows) {
    alertCountMap[a.patient_id] = (alertCountMap[a.patient_id] ?? 0) + 1;
    if (a.severity === "critical") hasCritical[a.patient_id] = true;
  }

  const logsMap: Record<string, { total: number; taken: number }> = {};
  for (const l of medLogs) {
    if (!logsMap[l.patient_id]) logsMap[l.patient_id] = { total: 0, taken: 0 };
    logsMap[l.patient_id]!.total++;
    if (l.status === "taken") logsMap[l.patient_id]!.taken++;
  }

  const checkedInIds = new Set(checkins.map((r: any) => r.patient_id as string));

  // Get patient names from profiles table (separate query, no join)
  const profileIds = patientRows.map((p: any) => p.profile_id as string).filter(Boolean);
  const { data: profileRows } = profileIds.length
    ? await (supabase as any).from("profiles").select("id, full_name").in("id", profileIds)
    : { data: [] as any[] };
  const profileMap: Record<string, string> = {};
  for (const pr of (profileRows ?? [])) profileMap[pr.id] = pr.full_name ?? "Unknown";

  // Enrich patients
  const patients = (patientRows ?? []).map((p: any) => {
    const logs = logsMap[p.id];
    const adherence = logs ? Math.round((logs.taken / logs.total) * 100) : 100;
    const alertCount = alertCountMap[p.id] ?? 0;
    const status: "critical" | "warning" | "stable" = hasCritical[p.id]
      ? "critical" : alertCount > 0 ? "warning" : "stable";
    return {
      id: p.id,
      name: profileMap[p.profile_id] ?? "Unknown",
      condition: p.primary_condition ?? "—",
      lastCheckIn: null,
      adherence,
      alerts: alertCount,
      status,
    };
  });

  // Alert names: get patient names for alerts
  const alertPatientProfileIds = (patientRows ?? []).reduce((m: Record<string, string>, p: any) => {
    m[p.id] = p.profile_id;
    return m;
  }, {});

  const alerts = (alertRows ?? []).map((a: any) => ({
    id: a.id,
    patient: profileMap[alertPatientProfileIds[a.patient_id] ?? ""] ?? "Unknown",
    type: a.type,
    severity: a.severity,
    message: a.message,
    time: a.created_at,
  }));

  const totalPatients = patients.length;
  const criticalCount = alerts.filter((a) => a.severity === "critical").length;
  const allLogs = Object.values(logsMap);
  const avgAdherence = allLogs.length
    ? Math.round(allLogs.reduce((s, l) => s + (l.total ? l.taken / l.total : 1), 0) / allLogs.length * 100)
    : 100;
  const checkedIn = checkedInIds.size;

  const stats = [
    { label: "Monitored Patients", value: String(totalPatients), icon: Users, trend: `${totalPatients} active consents`, color: "blue" as const },
    { label: "Active Alerts", value: String(alerts.length), icon: Bell, trend: criticalCount > 0 ? `${criticalCount} critical` : "None critical", color: "red" as const },
    { label: "Medication Adherence", value: `${avgAdherence}%`, icon: ShieldCheck, trend: "Today's doses", color: "green" as const },
    { label: "Check-ins Today", value: `${checkedIn}/${totalPatients}`, icon: Activity, trend: `${totalPatients - checkedIn} pending`, color: "amber" as const },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <PatientList patients={patients} />
          <VitalsChart />
        </div>
        <AlertsFeed alerts={alerts} />
      </div>
    </div>
  );
}
