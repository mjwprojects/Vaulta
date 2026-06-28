"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type PatientRow = {
  id: string;
  profile_id: string;
  date_of_birth: string;
  blood_type: string | null;
  allergies: string[];
  primary_condition: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  profile: { full_name: string; email: string; avatar_url: string | null };
  consent: { access_level: string; status: string };
};

export function usePatients() {
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("caregiver_consents")
      .select(`
        access_level, status,
        patient:patients(
          id, profile_id, date_of_birth, blood_type, allergies,
          primary_condition, emergency_contact_name, emergency_contact_phone,
          profile:profiles(full_name, email, avatar_url)
        )
      `)
      .eq("status", "active")
      .then(({ data, error: err }) => {
        if (err) { setError(err.message); setLoading(false); return; }
        const rows = (data ?? []).map((c: any) => ({
          ...c.patient,
          profile: c.patient.profile,
          consent: { access_level: c.access_level, status: c.status },
        }));
        setPatients(rows);
        setLoading(false);
      });
  }, []);

  return { patients, loading, error };
}
