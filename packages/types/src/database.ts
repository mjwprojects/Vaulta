export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at">;
        Update: Partial<Omit<Profile, "id">>;
      };
      patients: {
        Row: Patient;
        Insert: Omit<Patient, "created_at" | "updated_at">;
        Update: Partial<Omit<Patient, "id">>;
      };
      health_records: {
        Row: HealthRecord;
        Insert: Omit<HealthRecord, "id" | "created_at">;
        Update: Partial<Omit<HealthRecord, "id" | "patient_id">>;
      };
      medications: {
        Row: Medication;
        Insert: Omit<Medication, "id" | "created_at">;
        Update: Partial<Omit<Medication, "id">>;
      };
      medication_logs: {
        Row: MedicationLog;
        Insert: Omit<MedicationLog, "id" | "created_at">;
        Update: never;
      };
      alerts: {
        Row: Alert;
        Insert: Omit<Alert, "id" | "created_at">;
        Update: Partial<Pick<Alert, "status" | "resolved_at" | "resolved_by">>;
      };
      caregiver_consents: {
        Row: CaregiverConsent;
        Insert: Omit<CaregiverConsent, "id" | "created_at">;
        Update: Partial<Pick<CaregiverConsent, "status" | "revoked_at">>;
      };
      audit_logs: {
        Row: AuditLog;
        Insert: Omit<AuditLog, "id" | "created_at">;
        Update: never;
      };
      emergency_summaries: {
        Row: EmergencySummary;
        Insert: Omit<EmergencySummary, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<EmergencySummary, "id" | "patient_id">>;
      };
    };
  };
};

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: UserRole;
  mfa_enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type UserRole = "patient" | "caregiver" | "admin";

export type Patient = {
  id: string;
  profile_id: string;
  date_of_birth: string;
  blood_type: BloodType | null;
  allergies: string[];
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  primary_condition: string | null;
  created_at: string;
  updated_at: string;
};

export type BloodType = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";

export type HealthRecord = {
  id: string;
  patient_id: string;
  recorded_at: string;
  symptoms: string[];
  pain_level: number | null;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  heart_rate: number | null;
  temperature: number | null;
  oxygen_saturation: number | null;
  weight_kg: number | null;
  glucose_mmol: number | null;
  mood: MoodLevel | null;
  notes: string | null;
  created_at: string;
};

export type MoodLevel = 1 | 2 | 3 | 4 | 5;

export type Medication = {
  id: string;
  patient_id: string;
  name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date: string | null;
  prescribing_doctor: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
};

export type MedicationLog = {
  id: string;
  medication_id: string;
  patient_id: string;
  scheduled_at: string;
  taken_at: string | null;
  status: MedicationStatus;
  notes: string | null;
  created_at: string;
};

export type MedicationStatus = "taken" | "missed" | "skipped" | "pending";

export type Alert = {
  id: string;
  patient_id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  metadata: Json;
  status: AlertStatus;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
};

export type AlertType =
  | "emergency"
  | "medication_missed"
  | "vital_abnormal"
  | "symptom_reported"
  | "check_in_missed";

export type AlertSeverity = "critical" | "high" | "medium" | "low";
export type AlertStatus = "active" | "acknowledged" | "resolved" | "dismissed";

export type CaregiverConsent = {
  id: string;
  patient_id: string;
  caregiver_id: string;
  granted_at: string;
  revoked_at: string | null;
  access_level: AccessLevel;
  status: ConsentStatus;
  created_at: string;
};

export type AccessLevel = "full" | "read_only" | "emergency_only";
export type ConsentStatus = "active" | "revoked" | "pending";

export type AuditLog = {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  metadata: Json;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
};

export type EmergencySummary = {
  id: string;
  patient_id: string;
  blood_type: BloodType | null;
  allergies: string[];
  current_medications: string[];
  critical_conditions: string[];
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  dnr: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
};
