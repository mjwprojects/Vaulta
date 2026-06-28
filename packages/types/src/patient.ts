import type { HealthRecord, Medication, MedicationLog, Patient, Profile } from "./database";

export type PatientWithProfile = Patient & {
  profile: Profile;
};

export type HealthRecordWithPatient = HealthRecord & {
  patient: PatientWithProfile;
};

export type MedicationWithLogs = Medication & {
  logs: MedicationLog[];
};

export type DailyCheckIn = {
  date: string;
  health_record: HealthRecord | null;
  medications_taken: number;
  medications_total: number;
  alerts_count: number;
};

export type VitalTrend = {
  date: string;
  heart_rate: number | null;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  oxygen_saturation: number | null;
  temperature: number | null;
  glucose_mmol: number | null;
  weight_kg: number | null;
};
