# VAULTA_SECURITY_REVIEW.md

Audit date: 2026-07-02. Method: static review of all source + migrations; secret scan of tracked files; env handling review. Live Supabase advisors could not be run (project `hdhmlrabekahvfaivnwl` is not in the connected MCP account's org) — **run `get_advisors` from the Vaulta org before production hardening sign-off.**

## Findings by severity

### CRITICAL

**C-1 · Role self-selection at signup (privilege escalation to admin)**
`handle_new_user()` (migration 001:46) sets `role` from `raw_user_meta_data->>'role'`. Supabase signups are open by default, so anyone can call `supabase.auth.signUp({ email, password, options: { data: { role: 'admin' } } })` with the public anon key and become an **admin** — which today grants all-audit-log access and will silently inherit any future admin policy (including the planned master-admin surface).
*Fix:* in the trigger, accept only `'patient'`/`'caregiver'`, else default `'caregiver'`; never accept `'admin'`. Also prevent role changes via the profiles UPDATE policy (no `WITH CHECK` today — second escalation path) or a `security definer` guard trigger. Consider disabling public signups until registration UX ships.

**C-2 · Website/product overclaims on security (compliance exposure, health data)**
"End-to-end data security at every layer", "Fully audited access logs", "MFA-protected" (mobile login), "your medical information is encrypted" (invite page), "Immutable record of all data access" (audit page). None of these are fully true (no E2EE, no MFA, partial audit coverage, forgeable audit inserts). For a product handling minors'/family health data in South Africa this is POPIA-relevant marketing.
*Fix:* apply the brief §15.3 wording ("secure access controls, encrypted transport, protected storage, and audited permission-based sharing") and remove the MFA claim until MFA exists. Copy-only change; recommend doing it **before** any further marketing.

### HIGH

**H-1 · `audit_logs` INSERT `WITH CHECK (true)`** — any authenticated user can insert arbitrary audit rows attributed to any `user_id`… actually `user_id` is their choice entirely: the trail is forgeable and pollutable. Lock inserts to service role; route all logging through a server-side helper.

**H-2 · `alerts` INSERT `WITH CHECK (true)`** — any authenticated user can raise fake critical SOS alerts for any patient, or flood the alert feed. Scope to patient-own inserts; edge functions already use service role.

**H-3 · Invite acceptance doesn't verify invitee identity** — `acceptInviteAction` links whatever account is signed in to the patient record without checking `user.email === invite.email`. An invite link forwarded/leaked = patient record takeover. Fix in the server action (email match or explicit caregiver approval step).

**H-4 · Consent rows created by the caregiver** — consent-based sharing is currently self-granted by the accessor (see access-control review). Semantics fix required before marketing "consent-based sharing".

**H-5 · No MFA, no password reset, no rate limiting on auth** — password-only accounts guarding family health data. Supabase provides MFA/TOTP and reset emails; wire them.

### MEDIUM

**M-1 · Profiles UPDATE without WITH CHECK** — enables C-1's second path; also lets users edit `mfa_enabled` flag freely (cosmetic today).
**M-2 · `patients` caregiver UPDATE without WITH CHECK** — caregiver can rewrite `caregiver_id`/`profile_id` links.
**M-3 · Emergency page inserts audit rows with the user client and crashes on null profile** (`dashboard/emergency/[patientId]/page.tsx:62`) — availability bug on the most critical page; brief promises "zero friction in an emergency".
**M-4 · Stale example env files** point to the old Supabase project `kgbvmigzlefonzyqlegm` (also in migration 001 header). Two-project drift; a contributor following the examples writes to the wrong DB. Replace with placeholders.
**M-5 · Audit coverage** — patient-detail views, health-record reads, consent changes, logins are not logged; IP/user-agent columns never populated despite the UI showing an IP column.
**M-6 · Invite page leaks `primary_condition` to anyone holding the URL** pre-auth. Minimal, but health data on an unauthenticated page — consider showing name only.

### LOW

**L-1 · Anon keys committed in `.env.local.example`** — anon keys are public by design (RLS is the boundary); still, use placeholders (they're also the *old* project's keys).
**L-2 · `console.error` of Supabase errors in server actions** — fine; ensure no PHI in messages long-term.
**L-3 · Desktop app ships old dashboard with its own env; de-scoping it shrinks attack surface.**
**L-4 · `NEXT_PUBLIC_SITE_URL` fallback hardcodes `https://vaulta.co.za`** — fine for prod, wrong links in preview envs.

## What is genuinely done right ✅

- Service-role key used **only** in server contexts (`lib/supabase/admin.ts`, edge functions); never in client bundles; env-var based; clear error if missing.
- RLS enabled on every table; deny-by-default deletes; `has_caregiver_access()` helper is clean SECURITY DEFINER.
- Invite tokens are `gen_random_uuid()` with 7-day expiry, format-validated before lookup, RLS-protected table, admin-client read confined to the server component.
- Middleware auth gate + RLS backstop (defence in depth on data).
- `.gitignore` correctly excludes real env files (verified: no tracked secrets beyond public anon keys).
- No storage buckets exist yet, so no public-bucket exposure (the risk arrives with Phase 3 — bucket must be private with signed URLs from day one).

## Sign-off position

**Do not market the privacy claims or onboard real families until C-1, H-1, H-2, H-3 are fixed** (one migration + one server-action edit — small, contained work; see VAULTA_BUILD_PLAN.md Phase 1). C-2 is a copy edit that can ship today.
