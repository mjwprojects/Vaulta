import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { PatientList } from "@/components/dashboard/PatientList";
import Link from "next/link";
import { UserPlus } from "lucide-react";

export const metadata: Metadata = { title: "Patients" };
export const dynamic = "force-dynamic";

export default async function PatientsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const uid = user?.id ?? "";

  const { data: consents } = await supabase
    .from("caregiver_consents")
    .select("patient_id")
    .eq("caregiver_id", uid)
    .eq("status", "active");

  const patientIds = (consents ?? []).map((c: any) => c.patient_id as string);

  const { data: patientRows } = patientIds.length
    ? await supabase
        .from("patients")
        .select("id, primary_condition, profile_id")
        .in("id", patientIds)
    : { data: [] };

  const profileIds = (patientRows ?? []).map((p: any) => p.profile_id as string);
  const { data: profileRows } = profileIds.length
    ? await supabase.from("profiles").select("id, full_name").in("id", profileIds)
    : { data: [] };
  const profileMap: Record<string, string> = {};
  for (const pr of profileRows ?? []) profileMap[pr.id] = pr.full_name ?? "Unknown";

  const today = new Date().toISOString().split("T")[0];

  const { data: alertRows } = patientIds.length
    ? await supabase
        .from("alerts")
        .select("patient_id, severity")
        .in("patient_id", patientIds)
        .eq("status", "active")
    : { data: [] };

  const { data: medLogs } = patientIds.length
    ? await supabase
        .from("medication_logs")
        .select("patient_id, status")
        .in("patient_id", patientIds)
        .gte("scheduled_at", `${today}T00:00:00Z`)
    : { data: [] };

  const alertCount: Record<string, number> = {};
  const hasCritical: Record<string, boolean> = {};
  for (const a of alertRows ?? []) {
    alertCount[a.patient_id] = (alertCount[a.patient_id] ?? 0) + 1;
    if (a.severity === "critical") hasCritical[a.patient_id] = true;
  }

  const logsMap: Record<string, { total: number; taken: number }> = {};
  for (const l of medLogs ?? []) {
    if (!logsMap[l.patient_id]) logsMap[l.patient_id] = { total: 0, taken: 0 };
    logsMap[l.patient_id].total++;
    if (l.status === "taken") logsMap[l.patient_id].taken++;
  }

  const patients = (patientRows ?? []).map((p: any) => {
    const logs = logsMap[p.id];
    const adherence = logs ? Math.round((logs.taken / logs.total) * 100) : 100;
    const alerts = alertCount[p.id] ?? 0;
    const status: "critical" | "warning" | "stable" = hasCritical[p.id]
      ? "critical" : alerts > 0 ? "warning" : "stable";
    return {
      id: p.id,
      name: profileMap[p.profile_id] ?? "Unknown",
      condition: p.primary_condition ?? "—",
      lastCheckIn: null,
      adherence,
      alerts,
      status,
    };
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Patients</h1>
          <p className="text-sm text-slate-500 mt-0.5">{patients.length} patients under your care</p>
        </div>
        <Link
          href="/dashboard/patients/invite"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Add patient
        </Link>
      </div>

      {patients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <p className="text-slate-500 text-sm">No patients yet. Invite a patient to get started.</p>
        </div>
      ) : (
        <PatientList patients={patients} />
      )}
    </div>
  );
}
