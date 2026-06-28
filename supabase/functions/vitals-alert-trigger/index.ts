/**
 * Vitals Alert Trigger — Supabase Edge Function
 * Triggered via DB webhook on health_records INSERT.
 * Checks thresholds and auto-creates alerts for caregivers.
 *
 * Set up webhook in Supabase Dashboard:
 *   Table: health_records | Event: INSERT | URL: <function-url>
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const THRESHOLDS = {
  heart_rate:              { low: 40,  high: 130 },
  oxygen_saturation:       { low: 90,  high: null },
  blood_pressure_systolic: { low: 80,  high: 180 },
  temperature:             { low: 35,  high: 39.5 },
  glucose_mmol:            { low: 2.8, high: 11.1 },
};

Deno.serve(async (req: Request) => {
  const payload = await req.json();
  const record = payload.record;
  if (!record) return new Response("No record", { status: 400 });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const alerts: any[] = [];

  // Heart rate
  if (record.heart_rate) {
    const t = THRESHOLDS.heart_rate;
    if (record.heart_rate < t.low) {
      alerts.push({
        patient_id: record.patient_id,
        type: "vital_abnormal", severity: "high",
        title: "Low heart rate detected",
        message: `Heart rate ${record.heart_rate} bpm — below threshold of ${t.low} bpm`,
        metadata: { vital: "heart_rate", value: record.heart_rate, threshold: t.low },
      });
    } else if (record.heart_rate > t.high) {
      alerts.push({
        patient_id: record.patient_id,
        type: "vital_abnormal", severity: "high",
        title: "High heart rate detected",
        message: `Heart rate ${record.heart_rate} bpm — above threshold of ${t.high} bpm`,
        metadata: { vital: "heart_rate", value: record.heart_rate, threshold: t.high },
      });
    }
  }

  // Oxygen saturation
  if (record.oxygen_saturation !== null && record.oxygen_saturation < THRESHOLDS.oxygen_saturation.low) {
    const sev = record.oxygen_saturation < 85 ? "critical" : "high";
    alerts.push({
      patient_id: record.patient_id,
      type: "vital_abnormal", severity: sev,
      title: "Low oxygen saturation",
      message: `SpO₂ ${record.oxygen_saturation}% — below safe threshold of ${THRESHOLDS.oxygen_saturation.low}%`,
      metadata: { vital: "oxygen_saturation", value: record.oxygen_saturation },
    });
  }

  // Blood pressure
  if (record.blood_pressure_systolic) {
    const t = THRESHOLDS.blood_pressure_systolic;
    if (record.blood_pressure_systolic > t.high) {
      const sev = record.blood_pressure_systolic > 200 ? "critical" : "medium";
      alerts.push({
        patient_id: record.patient_id,
        type: "vital_abnormal", severity: sev,
        title: "Elevated blood pressure",
        message: `Blood pressure ${record.blood_pressure_systolic}/${record.blood_pressure_diastolic} mmHg — systolic above ${t.high}`,
        metadata: { vital: "blood_pressure", value: record.blood_pressure_systolic },
      });
    } else if (record.blood_pressure_systolic < t.low) {
      alerts.push({
        patient_id: record.patient_id,
        type: "vital_abnormal", severity: "high",
        title: "Low blood pressure",
        message: `Blood pressure ${record.blood_pressure_systolic}/${record.blood_pressure_diastolic} mmHg — critically low`,
        metadata: { vital: "blood_pressure", value: record.blood_pressure_systolic },
      });
    }
  }

  // Temperature
  if (record.temperature) {
    const t = THRESHOLDS.temperature;
    if (record.temperature > t.high) {
      alerts.push({
        patient_id: record.patient_id,
        type: "vital_abnormal", severity: record.temperature > 41 ? "critical" : "medium",
        title: "Elevated temperature",
        message: `Temperature ${record.temperature}°C — above threshold of ${t.high}°C`,
        metadata: { vital: "temperature", value: record.temperature },
      });
    }
  }

  // Glucose
  if (record.glucose_mmol) {
    const t = THRESHOLDS.glucose_mmol;
    if (record.glucose_mmol < t.low) {
      alerts.push({
        patient_id: record.patient_id,
        type: "vital_abnormal", severity: "critical",
        title: "Critically low blood glucose",
        message: `Glucose ${record.glucose_mmol} mmol/L — hypoglycaemia warning`,
        metadata: { vital: "glucose", value: record.glucose_mmol },
      });
    } else if (record.glucose_mmol > t.high) {
      alerts.push({
        patient_id: record.patient_id,
        type: "vital_abnormal", severity: "medium",
        title: "Elevated blood glucose",
        message: `Glucose ${record.glucose_mmol} mmol/L — above ${t.high} mmol/L`,
        metadata: { vital: "glucose", value: record.glucose_mmol },
      });
    }
  }

  // Pain — critical pain level
  if (record.pain_level && record.pain_level >= 8) {
    alerts.push({
      patient_id: record.patient_id,
      type: "symptom_reported", severity: record.pain_level >= 9 ? "critical" : "high",
      title: "Severe pain reported",
      message: `Patient reported pain level ${record.pain_level}/10`,
      metadata: { vital: "pain_level", value: record.pain_level },
    });
  }

  if (alerts.length > 0) {
    const { error } = await supabase.from("alerts").insert(
      alerts.map((a) => ({ ...a, status: "active", metadata: a.metadata ?? {} }))
    );
    if (error) return new Response(error.message, { status: 500 });
  }

  return new Response(JSON.stringify({ alerts_created: alerts.length }), {
    headers: { "Content-Type": "application/json" },
  });
});
