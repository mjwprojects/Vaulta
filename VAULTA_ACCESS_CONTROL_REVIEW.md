# VAULTA_ACCESS_CONTROL_REVIEW.md

Reviewed: middleware, RLS policies (migrations 001+002), server actions, and every client query path. Live-DB policy verification blocked (Vaulta Supabase project not accessible from the connected MCP account) — findings below are from the migration files, which are the only policy source of record in the repo.

## 1. Route protection (web)

| Layer | State |
|---|---|
| `middleware.ts` | Redirects unauthenticated `/dashboard/*` → login; `/invite/*` public by design. ✅ |
| Role-based routing | **None.** Any authenticated user (patient or caregiver) gets the caregiver dashboard shell. RLS limits *data*, not *interface*. Patients on web see a caregiver UI showing themselves. |
| Admin routes | None exist. |
| Direct URL access | `/dashboard/patients/[id]` and `/dashboard/emergency/[patientId]` fetch under RLS → unauthorised IDs return "not found". ✅ (verify with Test 10.5) |

## 2. RLS policy-by-policy assessment

### profiles
- Own-row select/update ✅. Caregiver-view-consented-patients ✅.
- **Gap:** update policy has no `WITH CHECK` restricting `role` — a user can UPDATE their own profile and set `role='admin'` **if** column-level privileges allow it (they do by default). Combined with C-1 below this is a second escalation path. Fix: trigger or `WITH CHECK (role = (select role from profiles where id = auth.uid()))`, or revoke role column from `authenticated`.

### patients
- Patient own select/update ✅. Caregiver select via `has_caregiver_access()` ✅ (SECURITY DEFINER helper, clean).
- Caregiver insert `WITH CHECK (caregiver_id = auth.uid())` ✅.
- Caregiver update `USING (caregiver_id = auth.uid())` — **no WITH CHECK**: a caregiver can reassign `caregiver_id`/`profile_id` on their own patients to arbitrary values. Low direct harm, but breaks link integrity. Add `WITH CHECK`.
- **No DELETE policies** anywhere → deletes denied for everyone (fail-safe ✅, but archival flows must use `status`).

### caregiver_consents
- "Patients manage own consents" (ALL) ✅ — revocation possible (mobile profile uses it).
- "Caregivers can insert own consents" `WITH CHECK (caregiver_id = auth.uid())` — **this is the consent-model hole**: any caregiver can insert a consent row for **any patient_id** without the patient being involved. Today it exists so the invite flow works, but it means *consent is asserted by the accessor*. Must move consent creation to the invite-accept step (server action, admin client) and drop this policy.

### health_records / medications / medication_logs
- Patient full CRUD on own rows ✅. Caregiver read-only via consent ✅.
- **Gap (functional):** caregivers cannot INSERT/UPDATE medications or logs, so caregiver-side med management is impossible without new policies keyed on `access_level = 'full'`.

### alerts
- Caregiver read/update via consent ✅.
- **"System can insert alerts" `WITH CHECK (true)`** — any authenticated user can insert any alert for any patient (fake SOS, alert flooding). Patients also *need* insert for SOS, so scope it: patient may insert for own `patient_id`; edge functions use service role anyway. **High priority fix.**
- Patients cannot read their own alerts (mobile never queries them — consistent, but odd).

### emergency_summaries
- Patient manage own ✅; caregiver read via consent ✅. No write path for caregiver-managed patients (their `profile_id` is null → nobody can create the summary except service role). Functional gap.

### audit_logs
- "System inserts audit logs" `WITH CHECK (true)` — **any user can forge/pollute the audit trail.** Should be service-role-only (server actions already use the admin client; `emergency/[patientId]/page.tsx` inserts via the user client and would need switching).
- No UPDATE/DELETE policies → effectively append-only ✅ (matches "immutable" claim structurally).
- Select: own rows + admins-all ✅ — but no admin exists to use it.

### patient_invites
- "Caregivers manage own invites" (ALL, `caregiver_id = auth.uid()`) ✅.
- Public invite page reads via **service role** after format-validating the token ✅; token is `gen_random_uuid()` — unguessable ✅; 7-day expiry ✅.
- **Accept flow does not check `user.email === invite.email`** — anyone who obtains the link while signed in can claim the patient record (link = bearer credential). At minimum warn/verify; recommend hard-verifying email match.

## 3. Isolation matrix (as designed, per policies)

| Access | Result |
|---|---|
| Patient A → Patient B data | Blocked ✅ (all patient policies keyed to `profile_id = auth.uid()`) |
| Caregiver A → Caregiver B's patients | Blocked ✅ (consent required) |
| Patient → caregiver routes | **Allowed (UI-level)** — sees caregiver shell with own data only. UX/positioning problem, not a data leak |
| Unauthenticated → dashboard | Blocked ✅ (middleware) + RLS backstop |
| Unauthenticated → invite page | Allowed by design; exposes invitee first/last name + condition to anyone holding the token. Acceptable; keep payload minimal (consider dropping `primary_condition`) |
| Any authenticated user → write `alerts`/`audit_logs` for anyone | **Allowed — must fix** |
| Signup → choose own role incl. admin | **Allowed via API — must fix (C-1)** |

## 4. Master admin boundaries (brief §2)

Not implemented. Required design (backend-enforced, not frontend):
1. Migration: `update profiles set role='admin' where email='mornay22@gmail.com';` + a protective trigger that only allows role changes via service role.
2. Admin RLS grants: read-only select policies on `patients`, `caregiver_consents`, `patient_invites`, `profiles`, `audit_logs` gated on `exists(select 1 from profiles where id=auth.uid() and role='admin')` — mirroring the existing admin policy on `audit_logs`.
3. `/admin` route group in web, gated server-side by profile role (never client-only).
4. Admin actions audited like everyone else's.

## 5. Priority fixes (ordered)

1. **C-1 escalation:** harden `handle_new_user` (whitelist `patient`/`caregiver`) + block role self-update. Migration, ~20 lines.
2. **Lock `audit_logs` + `alerts` inserts** to service role / scoped patient-own respectively.
3. **Consent semantics:** create consent at invite acceptance (admin client), drop caregiver self-insert policy, verify invitee email.
4. `WITH CHECK` on `patients` caregiver update.
5. Admin bootstrap + admin read policies (unblocks brief §2).
6. New feature policies (meds CRUD for `access_level='full'`, documents bucket policies) as those features are built.
