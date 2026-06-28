"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Alert } from "@vaulta/types";

export function useRealtimeAlerts(patientIds: string[]) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientIds.length) { setLoading(false); return; }
    const supabase = createClient();

    supabase
      .from("alerts")
      .select("*")
      .in("patient_id", patientIds)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .then(({ data }) => { setAlerts(data ?? []); setLoading(false); });

    const channel = supabase
      .channel("realtime-alerts")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "alerts",
        filter: `patient_id=in.(${patientIds.join(",")})`,
      }, (payload) => {
        if (payload.eventType === "INSERT") {
          setAlerts((prev) => [payload.new as Alert, ...prev]);
        } else if (payload.eventType === "UPDATE") {
          setAlerts((prev) =>
            prev.map((a) => a.id === (payload.new as Alert).id ? payload.new as Alert : a)
              .filter((a) => a.status === "active")
          );
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [patientIds.join(",")]);

  return { alerts, loading };
}
