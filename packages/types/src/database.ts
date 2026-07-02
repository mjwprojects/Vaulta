export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

type Rel = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne?: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

// Hand-maintained mirror of supabase/migrations/001 + 002.
// Insert types mark DB-defaulted / nullable columns optional so application
// code can insert without casts. Regenerate against the live schema when
// migrations change.
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          email: string;
          full_name?: string;
          avatar_url?: string | null;
          role?: UserRole;
          mfa_enabled?: boolean;
        };
        Update: Partial<Omit<Profile, "id" | "created_at" | "updated_at">>;
        Relationships: [];
      };
      patients: {
        Row: Patient;
        Insert: {
          id?: string;
          profile_id?: string | null;
          caregiver_id?: string | null;
          date_of_birth: string;
          blood_type?: BloodType | null;
          allergies?: string[];
          emergency_contact_name?: string | null;
          emergency_contact_phone?: string | null;
          primary_condition?: string | null;
          status?: PatientStatus;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          address?: string | null;
          medical_aid_name?: string | null;
          medical_aid_number?: string | null;
          notes?: string | null;
        };
        Update: Partial<Omit<Patient, "id" | "created_at" | "updated_at">>;
        Relationships: [
          Rel & { foreignKeyName: "patients_profile_id_fkey"; columns: ["profile_id"]; referencedRelation: "profiles"; referencedColumns: ["id"] },
          Rel & { foreignKeyName: "patients_caregiver_id_fkey"; columns: ["caregiver_id"]; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
      health_records: {
        Row: HealthRecord;
        Insert: {
          id?: string;
          patient_id: string;
          recorded_at?: string;
          symptoms?: string[];
          pain_level?: number | null;
          blood_pressure_systolic?: number | null;
          blood_pressure_diastolic?: number | null;
          heart_rate?: number | null;
          temperature?: number | null;
          oxygen_saturation?: number | null;
          weight_kg?: number | null;
          glucose_mmol?: number | null;
          mood?: MoodLevel | null;
          notes?: string | null;
        };
        Update: Partial<Omit<HealthRecord, "id" | "patient_id" | "created_at">>;
        Relationships: [
          Rel & { foreignKeyName: "health_records_patient_id_fkey"; columns: ["patient_id"]; referencedRelation: "patients"; referencedColumns: ["id"] },
        ];
      };
      medications: {
        Row: Medication;
        Insert: {
          id?: string;
          patient_id: string;
          name: string;
          dosage: string;
          frequency: string;
          start_date: string;
          end_date?: string | null;
          prescribing_doctor?: string | null;
          notes?: string | null;
          is_active?: boolean;
        };
        Update: Partial<Omit<Medication, "id" | "patient_id" | "created_at">>;
        Relationships: [
          Rel & { foreignKeyName: "medications_patient_id_fkey"; columns: ["patient_id"]; referencedRelation: "patients"; referencedColumns: ["id"] },
        ];
      };
      medication_logs: {
        Row: MedicationLog;
        Insert: {
          id?: string;
          medication_id: string;
          patient_id: string;
          scheduled_at: string;
          taken_at?: string | null;
          status?: MedicationStatus;
          notes?: string | null;
        };
        Update: Partial<Pick<MedicationLog, "taken_at" | "status" | "notes">>;
        Relationships: [
          Rel & { foreignKeyName: "medication_logs_medication_id_fkey"; columns: ["medication_id"]; referencedRelation: "medications"; referencedColumns: ["id"] },
          Rel & { foreignKeyName: "medication_logs_patient_id_fkey"; columns: ["patient_id"]; referencedRelation: "patients"; referencedColumns: ["id"] },
        ];
      };
      alerts: {
        Row: Alert;
        Insert: {
          id?: string;
          patient_id: string;
          type: AlertType;
          severity: AlertSeverity;
          title: string;
          message: string;
          metadata?: Json;
          status?: AlertStatus;
          resolved_at?: string | null;
          resolved_by?: string | null;
        };
        Update: Partial<Pick<Alert, "status" | "resolved_at" | "resolved_by">>;
        Relationships: [
          Rel & { foreignKeyName: "alerts_patient_id_fkey"; columns: ["patient_id"]; referencedRelation: "patients"; referencedColumns: ["id"] },
          Rel & { foreignKeyName: "alerts_resolved_by_fkey"; columns: ["resolved_by"]; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
      caregiver_consents: {
        Row: CaregiverConsent;
        Insert: {
          id?: string;
          patient_id: string;
          caregiver_id: string;
          granted_at?: string;
          revoked_at?: string | null;
          access_level?: AccessLevel;
          status?: ConsentStatus;
        };
        Update: Partial<Pick<CaregiverConsent, "status" | "revoked_at" | "access_level">>;
        Relationships: [
          Rel & { foreignKeyName: "caregiver_consents_patient_id_fkey"; columns: ["patient_id"]; referencedRelation: "patients"; referencedColumns: ["id"] },
          Rel & { foreignKeyName: "caregiver_consents_caregiver_id_fkey"; columns: ["caregiver_id"]; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
      audit_logs: {
        Row: AuditLog;
        Insert: {
          id?: string;
          user_id: string;
          action: string;
          resource_type: string;
          resource_id: string;
          metadata?: Json;
          ip_address?: string | null;
          user_agent?: string | null;
        };
        Update: never;
        Relationships: [
          Rel & { foreignKeyName: "audit_logs_user_id_fkey"; columns: ["user_id"]; referencedRelation: "profiles"; referencedColumns: ["id"] },
        ];
      };
      emergency_summaries: {
        Row: EmergencySummary;
        Insert: {
          id?: string;
          patient_id: string;
          blood_type?: BloodType | null;
          allergies?: string[];
          current_medications?: string[];
          critical_conditions?: string[];
          emergency_contact_name?: string | null;
          emergency_contact_phone?: string | null;
          dnr?: boolean;
          notes?: string | null;
        };
        Update: Partial<Omit<EmergencySummary, "id" | "patient_id" | "created_at" | "updated_at">>;
        Relationships: [
          Rel & { foreignKeyName: "emergency_summaries_patient_id_fkey"; columns: ["patient_id"]; isOneToOne: true; referencedRelation: "patients"; referencedColumns: ["id"] },
        ];
      };
      patient_invites: {
        Row: PatientInvite;
        Insert: {
          id?: string;
          token?: string;
          caregiver_id: string;
          patient_id?: string | null;
          first_name: string;
          last_name: string;
          email: string;
          date_of_birth: string;
          primary_condition?: string | null;
          status?: InviteStatus;
          expires_at?: string;
          accepted_at?: string | null;
          last_viewed_at?: string | null;
          view_count?: number;
        };
        Update: Partial<Pick<PatientInvite, "status" | "accepted_at" | "last_viewed_at" | "view_count" | "expires_at" | "patient_id">>;
        Relationships: [
          Rel & { foreignKeyName: "patient_invites_caregiver_id_fkey"; columns: ["caregiver_id"]; referencedRelation: "profiles"; referencedColumns: ["id"] },
          Rel & { foreignKeyName: "patient_invites_patient_id_fkey"; columns: ["patient_id"]; referencedRelation: "patients"; referencedColumns: ["id"] },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      has_caregiver_access: {
        Args: { p_patient_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      user_role: UserRole;
      blood_type: BloodType;
      mood_level: MoodLevel;
      medication_status: MedicationStatus;
      alert_type: AlertType;
      alert_severity: AlertSeverity;
      alert_status: AlertStatus;
      access_level: AccessLevel;
      consent_status: ConsentStatus;
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
  profile_id: string | null;
  caregiver_id: string | null;
  date_of_birth: string;
  blood_type: BloodType | null;
  allergies: string[];
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  primary_condition: string | null;
  status: PatientStatus;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  address: string | null;
  medical_aid_name: string | null;
  medical_aid_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type PatientStatus = "active" | "inactive" | "archived";

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

// Postgres enum mood_level is stored as text '1'..'5'
export type MoodLevel = "1" | "2" | "3" | "4" | "5";

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

export type PatientInvite = {
  id: string;
  token: string;
  caregiver_id: string;
  patient_id: string | null;
  first_name: string;
  last_name: string;
  email: string;
  date_of_birth: string;
  primary_condition: string | null;
  status: InviteStatus;
  expires_at: string;
  accepted_at: string | null;
  last_viewed_at: string | null;
  view_count: number;
  created_at: string;
  updated_at: string;
};

export type InviteStatus = "pending" | "accepted" | "revoked" | "expired";
