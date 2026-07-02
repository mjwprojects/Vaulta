# VAULTA_BUILD_PLAN.md

Staged to match brief §22, re-sequenced by risk. Every phase ends deployable. Estimates are focused build-sessions, not calendar days.

## Guiding decisions (proposed — confirm before Phase 2)

- **Vault model:** keep "caregiver = vault owner" for MVP; add a thin `vaults` table (name + owner) so the family container is real and multi-caregiver becomes possible later. Avoid a deep org model now.
- **De-scope the desktop app** (archive `apps/desktop`); web serves caregivers. Cuts maintenance and type-check failures.
- **Mobile:** fix types and keep building, but web-responsive patient views are the fallback if Expo publishing delays MVP.
- **Website copy fix ships first** — it's the cheapest way to stop overclaiming (security C-2).

## Phase 0 — Stop the bleeding (½ session) ✅ prerequisite for marketing

1. Site copy: replace "end-to-end data security at every layer" per brief §15.3; remove "MFA-protected" from mobile login; retitle audit page; soften invite-page encryption line.
2. Regenerate `packages/types/src/database.ts` from live schema; remove `(supabase as any)` casts; fixes mobile `never` errors.
3. Bug fixes: emergency-page null crash; "Unknown" patient names on overview; empty overview chart.

## Phase 1 — Auth, roles, master admin (1–2 sessions) 🔐 requires migration approval

Migration `003_auth_hardening.sql`:
- `handle_new_user`: whitelist roles (`patient`/`caregiver` only, never `admin`).
- Guard trigger blocking `profiles.role` changes except via service role.
- Bootstrap `mornay22@gmail.com` → `admin` (idempotent, by email).
- Lock `audit_logs` INSERT to service role; scope `alerts` INSERT to patient-own rows.
- `WITH CHECK` on caregiver patient-update policy.
- Admin read policies (profiles, patients, consents, invites) gated on admin role.

App work:
- `/auth/register` (caregiver signup + invited-patient signup honouring `?next=/invite/:token`); `/auth/forgot-password`.
- Invite accept: verify `user.email === invite.email`; create the consent record at accept time (and stop pre-creating it at invite time — drop caregiver consent self-insert policy).
- Minimal `/admin` route group (users, invitations, system info), server-side role gate.
- Verification: Tests 2, 4, 10, 11 (see VAULTA_TEST_PLAN.md).

## Phase 2 — Vault + data model foundations (1–2 sessions) 🔐 migration

Migration `004_vaults_and_structures.sql`: `vaults`, `vault_members`, structured `allergies` + `conditions` tables (backfill from `patients.allergies`), `caregiver_consents.scope`, audit-helper function. Update invite flow to attach patients to the caregiver's default vault. Regenerate types.

## Phase 3 — Medical records + documents (2 sessions) 🔐 migration + storage

- `medical_records` (diagnosis/lab/clinical-note) + `documents` tables; **private** `patient-documents` bucket; storage RLS (owner patient + consented caregiver, signed URLs only).
- Caregiver UI: add/view records + upload on patient file; patient mobile/web: view own + upload.
- Audit every record/document view via server routes. Verification: Test 7.

## Phase 4 — Medication engine (1–2 sessions) 🔐 migration

- RLS: caregivers with `access_level='full'` can insert/update meds + schedules.
- `medication_schedules` + daily dose-generator (pg_cron or edge function) inserting `medication_logs` — **this makes the existing mobile med screen actually light up.**
- Refill/renewal columns + reminder job creating `alerts`.
- Caregiver med CRUD UI on patient file. Verification: Test 8.

## Phase 5 — Emergency + allergies complete (1 session)

- Emergency summary edit UI (caregiver + patient); mobile emergency-card tab; allergy CRUD with severity/reaction; surface critical allergies at top of patient file and before med-add.
- Optional tokenised public emergency card — **explicitly deferred**; design consent + expiry first. Verification: Test 9, §14 test.

## Phase 6 — Care plans + appointments (1–2 sessions) 🔐 migration

`care_plans`, `care_plan_tasks`, `appointments`; caregiver plan builder; patient "care instructions" view; timeline as a query over tasks+appointments+records. Verification: §13 test.

## Phase 7 — Messaging (1 session) 🔐 migration

`messages` keyed by patient_id; RLS: patient + consented caregiver only; realtime subscription; unread badges both sides. Verification: Test in brief §19.

## Phase 8 — Dashboards round-out (1 session)

Caregiver: renewals-due, missed check-ins, unread messages, invitation status table, recent documents. Patient home: schedule, appointments, instructions. Role-aware post-login routing.

## Phase 9 — QA + completion (1 session)

Build/type-check/lint green across workspace (or desktop archived); seed test family; run all 11 acceptance tests; add automated tests for RLS isolation (SQL) and invite flow; complete VAULTA_COMPLETION_REPORT.md; write rollback notes per migration.

## Recommended route structure (brief §20 decision)

Keep Next.js App Router groups rather than the brief's literal paths: `/dashboard/*` (caregiver), `/patient/*` (patient web), `/admin/*`, `/auth/{login,register,forgot-password}`, `/invite/[token]`. Rationale: `/dashboard` is already live and bookmarked; adding sibling groups is lower-risk than renaming everything to `/caregiver/*`.

## Risk register

| Risk | Rank | Mitigation |
|---|---|---|
| Migrations applied to wrong/old project (two project refs in repo) | High | Confirm live project = `hdhmlrabekahvfaivnwl` before every migration; adopt Supabase CLI migration tracking |
| RLS regression exposing patient data | High | SQL isolation tests in Phase 9; advisors run after each migration |
| Invite/consent rework breaks existing accepted links | Medium | Migration keeps existing consent rows; only new flow changes |
| Mobile publishing (Expo/EAS, stores) delays patient experience | Medium | Patient web views as fallback |
| Scope creep (brief lists ~40 entities) | Medium | Phases 2–7 only build what a screen consumes that phase |
