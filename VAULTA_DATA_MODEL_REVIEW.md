# VAULTA_DATA_MODEL_REVIEW.md

Existing structures were mapped before proposing anything new (brief §8 rule: do not duplicate).

## 1. Existing tables (migrations 001 + 002)

| Table | Purpose | Assessment |
|---|---|---|
| `profiles` | Mirrors `auth.users`; single `role` enum (`patient`/`caregiver`/`admin`) | Sound base; single-role is the main limitation |
| `patients` | Health profile; after 002 supports caregiver-managed patients (`profile_id` nullable, `caregiver_id`, name/contact/medical-aid columns) | Dual-ownership model (profile-linked OR caregiver-managed) is workable but under-documented; allergies as `text[]` is too flat for the alert system promise |
| `caregiver_consents` | Caregiver↔patient link with `access_level`, `status`, revocation timestamp | Good shape; semantics wrong (created by caregiver, not granted by patient) |
| `health_records` | One row per check-in: vitals + mood + pain + symptoms + notes | Good pragmatic design for logging; **name collides with the website's "Medical Records" promise — it stores readings, not records** |
| `medications` | Name, dosage, frequency (free text), dates, doctor, active flag | Missing: refill/renewal dates, pharmacy, structured schedule |
| `medication_logs` | Scheduled dose instances with status | Sound, but **nothing ever inserts rows** — schedule generation is unbuilt |
| `alerts` | Typed, severity-ranked alert stream | Good |
| `emergency_summaries` | 1:1 with patient; blood type, allergies, meds, conditions, contacts, DNR | Good shape; no write UI; duplicates fields also on `patients` (drift risk — pick one source of truth) |
| `audit_logs` | Actor, action, resource, metadata, IP/UA | Right columns; IP/UA never populated; insert policy too open |
| `patient_invites` | Tokenised invites w/ expiry, status, view tracking | Good shape; `view_count`/`last_viewed_at` dead columns (never updated) |

## 2. Brief target model → mapping

| Brief entity | Maps to | Action |
|---|---|---|
| `user_profiles`, `roles`, `user_roles` | `profiles.role` | **Add `user_roles` join table** for multi-role; keep `profiles.role` as default context or deprecate |
| `families`/`vaults`, `family_members` | — | **Add** `vaults` (id, name, owner_profile_id) + `vault_members` (vault_id, patient_id) — or explicitly decide caregiver=vault and document it |
| `caregivers`, `patients`, `caregiver_patient_links` | `profiles`, `patients`, `caregiver_consents` | Exists — reuse |
| `invitations` | `patient_invites` | Exists — reuse; extend for caregiver invites later |
| `consents` | `caregiver_consents` | Exists — fix grant semantics |
| `audit_logs`, `access_logs` | `audit_logs` | Exists — one table is enough if reads are logged too |
| `medical_records`, `documents`, `document_categories`, `diagnoses`, `clinical_notes`, `lab_results` | — | **Add** `medical_records` (patient_id, type enum: diagnosis/lab_result/clinical_note/other, title, body, recorded_by, occurred_at) + `documents` (record_id nullable, patient_id, storage_path, mime, size, uploaded_by) + private storage bucket `patient-documents` |
| `allergies`, `conditions` | `patients.allergies text[]`, `primary_condition` | **Add** structured `allergies` (patient_id, allergen, severity, reaction, notes) and `conditions`; keep legacy columns during migration, then backfill |
| `emergency_contacts` | columns on `patients`/`emergency_summaries` | Adequate for MVP (single contact); table only if multiple contacts needed |
| `emergency_summaries`, `blood_type`, `medical_aid_details`, `doctor_details`, `pharmacy_details` | `emergency_summaries` + `patients` columns | Reuse; add doctor/pharmacy columns to `medications` or `patients` as needed |
| `medication_schedules` | `medications.frequency` (free text) | **Add** `medication_schedules` (medication_id, time_of_day[], days_of_week) + a generator job that inserts `medication_logs` daily — this is the missing engine |
| `scripts`, `script_renewals`, `refill_reminders` | — | **Add** minimal: `refill_date`, `renewal_date`, `pharmacy` columns on `medications` + reminder cron creating `alerts`; separate tables only if repeat-script workflow grows |
| `care_plans`, `care_plan_tasks`, `appointments`, `appointment_notes`, `treatment_timeline`, `caregiver_instructions` | — | **Add** `care_plans`, `care_plan_tasks` (assignee, due, status), `appointments` (patient_id, at, location, notes); treatment timeline can be a view over records+appointments+plan tasks rather than its own table |
| `health_logs`, `sugar_readings`, `blood_pressure_readings`, etc. | `health_records` | **Exists — do not split.** One wide check-in row is better for this product than 7 reading tables |
| `mood_checkins`, `symptom_logs`, `daily_checkins` | `health_records` (mood, symptoms) | Exists |
| `messages`, `message_threads`, `read_receipts` | — | **Add** `messages` (patient_id as thread key, sender_profile_id, body, read_at); explicit thread table unnecessary at this scale |
| `alerts`, `notification_events`, `reminders` | `alerts` | Exists — reuse for reminders (new alert types) |

## 3. Schema debt to fix regardless of new features

1. **Regenerate `packages/types` from the live DB** — currently missing `patient_invites` and all 002 columns; this is why the codebase is full of `(supabase as any)` and mobile fails type-check.
2. `profiles.role` sourced from signup metadata (security C-1) — restrict trigger to `patient`/`caregiver` and never `admin`.
3. Duplicate emergency data on `patients` vs `emergency_summaries` — decide source of truth (recommend `emergency_summaries` for card data; keep `patients.allergies` as the write path feeding it, or migrate to structured `allergies` table).
4. Dead columns: `patient_invites.view_count`, `last_viewed_at`, `audit_logs.ip_address`, `user_agent` — wire or drop.
5. `caregiver_consents` lacks `scope`; add if consent-based sharing is to mean anything granular.
6. Migration hygiene: 001 references old project; add a `003` baseline check or use Supabase CLI migration tracking so local files and live DB can't drift silently.
