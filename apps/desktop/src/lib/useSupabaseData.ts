import { useEffect, useState, useCallback } from "react";
import { supabase } from "./supabase";

export type DashboardData = {
  patients: PatientRow[];
  alerts: AlertRow[];
  loading: boolean;
  refresh: () => void;
};

export type PatientRow = {
  id: string;
  name: string;
  condition: string;
  lastCheckIn: string | null;
  adherence: number;
  alertCount: number;
  status: "critical" | "warning" | "stable";
};

export type AlertRow = {
  id: string;
  patient: string;
  type: string;
  severity: string;
  title: string;
  message: string;
  status: string;
  time: string;
};

export function useDashboardData(userId: string | undefined): DashboardData {
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    const { data: consents } = await supabase
      .from("caregiver_consents")
      .select("patient_id, patients(id, primary_condition, profiles(full_name))")
      .eq("caregiver_id", userId)
      .eq("status", "active");

    const patientIds = (consents ?? []).map((c: any) => c.patient_id);

    const today = new Date().toISOString().split("T")[0];
    const [{ data: alertRows }, { data: medLogs }] = await Promise.all([
      patientIds.length
        ? supabase
            .from("alerts")
            .select("id, patient_id, type, severity, title, message, status, created_at, patients(profiles(full_name))")
            .in("patient_id", patientIds)
            .order("created_at", { ascending: false })
            .limit(100)
        : Promise.resolve({ data: [] }),
      patientIds.length
        ? supabase
            .from("medication_logs")
            .select("patient_id, status")
            .in("patient_id", patientIds)
            .gte("scheduled_time", `${today}T00:00:00Z`)
        : Promise.resolve({ data: [] }),
    ]);

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

    const mapped: PatientRow[] = (consents ?? []).map((c: any) => {
      const p = c.patients;
      const logs = logsMap[p.id];
      const adherence = logs ? Math.round((logs.taken / logs.total) * 100) : 100;
      const count = alertCount[p.id] ?? 0;
      const status: PatientRow["status"] = hasCritical[p.id] ? "critical" : count > 0 ? "warning" : "stable";
      return {
        id: p.id,
        name: p.profiles?.full_name ?? "Unknown",
        condition: p.primary_condition ?? "—",
        lastCheckIn: null,
        adherence,
        alertCount: count,
        status,
      };
    });

    const mappedAlerts: AlertRow[] = (alertRows ?? []).map((a: any) => ({
      id: a.id,
      patient: a.patients?.profiles?.full_name ?? "Unknown",
      type: a.type,
      severity: a.severity,
      title: a.title,
      message: a.message,
      status: a.status,
      time: a.created_at,
    }));

    setPatients(mapped);
    setAlerts(mappedAlerts);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();

    const channel = supabase
      .channel("desktop-alerts")
      .on("postgres_changes", { event: "*", schema: "public", table: "alerts" }, load)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "health_records" }, load)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [load]);

  return { patients, alerts, loading, refresh: load };
}
