import type { Alert, AlertSeverity, AlertType } from "./database";

export type AlertWithPatient = Alert & {
  patient: { id: string; full_name: string; avatar_url: string | null };
};

export type AlertFilter = {
  severity?: AlertSeverity[];
  type?: AlertType[];
  status?: Alert["status"][];
  patient_id?: string;
  from?: string;
  to?: string;
};

export type EmergencyWorkflow = {
  alert_id: string;
  patient_id: string;
  triggered_at: string;
  acknowledged_by: string | null;
  acknowledged_at: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  notes: string | null;
};
