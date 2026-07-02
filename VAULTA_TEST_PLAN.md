# VAULTA_TEST_PLAN.md

Maps the brief §23 acceptance tests to current status and the phase that makes each passable. "Blocked" = cannot be executed today because the feature/flow doesn't exist.

| # | Test | Status today (2026-07-02) | Blocker | Passable after |
|---|---|---|---|---|
| 1 | Website promise test (per feature) | ❌ Fails for Medical Records, Care Plans, refill reminders, E2E security claim | Features missing | Phases 3–7 (or Phase 0 copy fix narrows the promise) |
| 2 | Master admin (`mornay22@gmail.com`) | ❌ No admin role assigned, no admin UI | Phase 1 | Phase 1 |
| 3 | Family vault (2 patients, no leakage) | 🟡 Partially executable: caregiver can add 2 patients via invites; isolation should hold per RLS; no vault entity; **records isolation untestable (no records)** | Vaults + records | Phases 2–3 |
| 4 | Caregiver invitation end-to-end | ❌ Breaks at step 5: invited user without an account cannot register | No signup UI | Phase 1 |
| 5 | Patient mobile use | 🟡 Login, check-in, SOS work in dev; ❌ document upload, emergency card, message | Missing modules; app not published | Phases 3, 5, 7 |
| 6 | Caregiver oversight | 🟡 Health log + vitals visible; ❌ documents, med status (no data path), messages | Med engine, docs, messaging | Phases 3, 4, 7 |
| 7 | Medical records (upload/retrieve/permission/log) | ❌ Entirely | No storage/tables | Phase 3 |
| 8 | Medication + refill reminders | ❌ No add-medication UI; no schedule generation; no refill fields | Phase 4 | Phase 4 |
| 9 | Emergency summary | 🟡 Web page renders when data exists (via SQL); ❌ crash for caregiver-managed patients; ❌ no data-entry UI; ❌ no mobile card | Phase 0 (crash) + Phase 5 | Phase 5 |
| 10 | Privacy & security | 🟡 10.1/10.2/10.4/10.5 expected to pass per RLS (verify live); ❌ 10.3 (patients reach caregiver UI); ❌ 10.6 n/a (no files); ❌ 10.7 (audit gaps + forgeable) | Phase 1 fixes | Phase 1 (re-run fully after Phase 3) |
| 11 | Multi-role user | ❌ No role model / context switching | Phase 1–2 design | Phase 2 |

## Automated tests to add (none exist today)

1. **RLS isolation suite (highest value):** SQL tests (Supabase CLI `supabase test db` / pgTAP) — patient A vs B on every table; caregiver without consent; revoked consent; forged `alerts`/`audit_logs` inserts rejected; role escalation via signup metadata rejected.
2. **Invite flow integration test:** create → accept (email mismatch rejected; expired rejected; reuse rejected; consent row created at accept).
3. **Unit:** adherence calculation, `patientDisplayName`, schedule generator (once built).
4. **Build gates in CI:** `pnpm type-check` + `pnpm build` for web on every push (GitHub Actions), lint once configured.

## Manual QA checklist per release

- Login/logout/session persistence after refresh.
- Invite full loop with a fresh email inbox.
- Check-in on mobile → appears on caregiver dashboard in <5s (realtime).
- SOS → critical alert renders with badge.
- Emergency page for BOTH linked and caregiver-managed patients.
- Direct-URL probes of another user's patient/emergency/audit routes.
- Vercel preview + production env vars point to `hdhmlrabekahvfaivnwl`.
