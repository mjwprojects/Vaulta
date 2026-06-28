import type { CaregiverConsent, Patient, Profile } from "./database";

export type CaregiverWithProfile = {
  id: string;
  profile: Profile;
  consent: CaregiverConsent;
};

export type PatientSummary = {
  patient: Patient & { profile: Profile };
  consent: CaregiverConsent;
  last_check_in: string | null;
  active_alerts: number;
  medication_adherence_7d: number;
};

export type CaregiverDashboard = {
  caregiver: Profile;
  patients: PatientSummary[];
  total_active_alerts: number;
  patients_needing_attention: number;
};
