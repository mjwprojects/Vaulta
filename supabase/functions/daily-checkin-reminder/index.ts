/**
 * Daily Check-in Reminder — Supabase Edge Function (cron)
 * Runs at 09:00 daily. Creates alerts for patients who haven't checked in today.
 *
 * Schedule in Supabase Dashboard (Database > Cron):
 *   0 7 * * *   (07:00 UTC = 09:00 SAST)
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const today = new Date().toISOString().split("T")[0];

  // Find all patients who have not checked in today
  const { data: patients } = await supabase.from("patients").select("id");
  if (!patients?.length) return new Response("No patients", { status: 200 });

  const { data: todayRecords } = await supabase
    .from("health_records")
    .select("patient_id")
    .gte("recorded_at", `${today}T00:00:00Z`)
    .lte("recorded_at", `${today}T23:59:59Z`);

  const checkedInIds = new Set((todayRecords ?? []).map((r: any) => r.patient_id));
  const missedIds = patients.filter((p: any) => !checkedInIds.has(p.id)).map((p: any) => p.id);

  if (!missedIds.length) return new Response(JSON.stringify({ reminders: 0 }), { status: 200 });

  // Check if reminder already created today for these patients
  const { data: existingAlerts } = await supabase
    .from("alerts")
    .select("patient_id")
    .in("patient_id", missedIds)
    .eq("type", "check_in_missed")
    .gte("created_at", `${today}T00:00:00Z`);

  const alreadyAlerted = new Set((existingAlerts ?? []).map((a: any) => a.patient_id));
  const toAlert = missedIds.filter((id: string) => !alreadyAlerted.has(id));

  if (!toAlert.length) return new Response(JSON.stringify({ reminders: 0, already_alerted: missedIds.length }), { status: 200 });

  const { error } = await supabase.from("alerts").insert(
    toAlert.map((patient_id: string) => ({
      patient_id,
      type: "check_in_missed",
      severity: "low",
      title: "Daily check-in not completed",
      message: "Patient has not submitted their daily health check-in today.",
      metadata: { date: today },
      status: "active",
    }))
  );

  if (error) return new Response(error.message, { status: 500 });
  return new Response(JSON.stringify({ reminders: toAlert.length }), {
    headers: { "Content-Type": "application/json" },
  });
});
