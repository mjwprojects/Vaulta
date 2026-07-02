# Decisions Log

| Date | Decision | Reason | Impact | Owner |
|---|---|---|---|---|
| 2026-07-02 | Full audit completed before any build work (10 VAULTA_*.md docs in repo root) | Master brief required audit-first; website claims outrun the code | Build phases now risk-ranked in VAULTA_BUILD_PLAN.md | Claude Code |
| 2026-07-02 | No migrations or code changes applied during audit session | Global rule: confirm before migrations; brief: audit before rebuilding | Critical security fixes (role escalation, forgeable audit/alert inserts) documented but **not yet applied** — awaiting approval | Mornay |
| 2026-07-02 | Recommended: soften "end-to-end data security" site copy per brief §15.3 | No E2EE implemented; POPIA-relevant overclaim on health data | Copy-only change, can ship immediately on approval | Mornay |
| 2026-07-02 | Recommended: de-scope `apps/desktop` (Tauri) | Duplicates web dashboard, fails type-check, adds surface | Pending approval | Mornay |
| 2026-07-02 | Recommended: vault model = thin `vaults` table owned by caregiver (not deep org model) | Smallest change satisfying "1 vault for your whole family" | Shapes Phase 2 migration | Mornay |
| 2026-07-02 | Phases 0+1 approved and executed (code); migration `003_auth_hardening.sql` written, **not yet applied** (Supabase MCP has no access to Vaulta org) | Mornay approved; MCP account only sees MJW org | Mornay must run 003 in the SQL editor BEFORE deploying this code | Mornay |
| 2026-07-02 | Consent model changed: consent row created at invite ACCEPTANCE (service role), caregiver access to self-created patients via `patients.caregiver_id` | "Consent-based sharing" must mean patient-granted | Invite flow + RLS helper reworked; old consent rows unaffected | Claude Code |
| 2026-07-02 | Desktop app de-scoped via pnpm workspace exclusion (code kept in `apps/desktop`) | Approved; failing type-check, duplicate surface | Workspace type-check now green | Mornay |
| 2026-07-02 | Upgraded `@supabase/ssr` 0.5.2→0.8.x; root `@types/react@19` + pnpm packageExtensions for `next` | Old ssr typings collapsed queries to `never`; RN hoisted @types/react@18 broke web JSX | Full workspace type-check passes | Claude Code |
