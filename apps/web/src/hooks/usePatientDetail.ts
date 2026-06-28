"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { HealthRecord, Medication, MedicationLog, Alert } from "@vaulta/types";

export type PatientDetail = {
  id: string;
  profile_id: string;
  date_of_birth: string;
  blood_type: string | null;
  allergies: string[];
  primary_condition: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  profile: { full_name: string; email: string; avatar_url: string | null };
  health_records: HealthRecord[];
  medications: (Medication & { logs: MedicationLog[] })[];
  alerts: Alert[];
};

export function usePatientDetail(patientId: string) {
  const [patient, setPatient] = useState<PatientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) return;
    const supabase = createClient();

    async function load() {
      const [patientRes, recordsRes, medsRes, alertsRes] = await Promise.all([
        supabase
          .from("patients")
          .select("*, profile:profiles(full_name, email, avatar_url)")
          .eq("id", patientId)
          .single(),
        supabase
          .from("health_records")
          .select("*")
          .eq("patient_id", patientId)
          .order("recorded_at", { ascending: false })
          .limit(30),
        supabase
          .from("medications")
          .select("*, logs:medication_logs(*)")
          .eq("patient_id", patientId)
          .eq("is_active", true),
        supabase
          .from("alerts")
          .select("*")
          .eq("patient_id", patientId)
          .order("created_at", { ascending: false })
          .limit(20),
      ]);

      if (patientRes.error) { setError(patientRes.error.message); setLoading(false); return; }

      setPatient({
        ...(patientRes.data as any),
        health_records: recordsRes.data ?? [],
        medications: (medsRes.data ?? []) as any,
        alerts: (alertsRes.data ?? []) as any,
      });
      setLoading(false);
    }

    load();

    // Realtime: subscribe to new health records
    const supabase2 = createClient();
    const channel = supabase2
      .channel(`patient-${patientId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "health_records",
        filter: `patient_id=eq.${patientId}`,
      }, (payload) => {
        setPatient((prev) =>
          prev ? { ...prev, health_records: [payload.new as HealthRecord, ...prev.health_records] } : prev
        );
      })
      .subscribe();

    return () => { supabase2.removeChannel(channel); };
  }, [patientId]);

  return { patient, loading, error };
}
