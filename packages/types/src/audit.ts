export type AuditAction =
  | "login"
  | "logout"
  | "mfa_enabled"
  | "mfa_disabled"
  | "consent_granted"
  | "consent_revoked"
  | "patient_data_viewed"
  | "health_record_created"
  | "health_record_updated"
  | "emergency_summary_viewed"
  | "alert_acknowledged"
  | "alert_resolved"
  | "medication_log_created"
  | "profile_updated";

export type AuditFilter = {
  user_id?: string;
  action?: AuditAction[];
  resource_type?: string;
  from?: string;
  to?: string;
};
