# VAULTA_CODE_AUDIT.md

Audit date: 2026-07-02
Auditor: Claude Code (per Vaulta Master Build & Audit Brief)
Scope: full repository at commit `4448dd6` on `main`.

## 1. Framework and app structure

| Area | Finding | Status |
|---|---|---|
| Monorepo | pnpm workspace + Turborepo. `apps/web` (Next.js 15 App Router), `apps/mobile` (Expo / React Native), `apps/desktop` (Tauri + Vite + React), `packages/{types,ui,utils,supabase}` | Working |
| Web app | Landing page, login, caregiver dashboard (overview, patients, patient detail, alerts, audit, settings, emergency summary), patient invite flow | Partially working |
| Mobile app | Patient experience: home, daily check-in, medications, SOS, profile, login | Partially working (type-check fails, not published) |
| Desktop app | Tauri mirror of caregiver dashboard (overview, patients, alerts, audit log) | Broken (type-check fails); duplicates web — questionable value |
| Deployment | Vercel (`vaulta.co.za` live), Supabase project `hdhmlrabekahvfaivnwl` | Working (web) |

## 2. Routing structure (web, actual)

Public: `/`, `/auth/login`, `/invite/[token]`
Authenticated: `/dashboard`, `/dashboard/patients`, `/dashboard/patients/[id]`, `/dashboard/patients/invite`, `/dashboard/alerts`, `/dashboard/audit`, `/dashboard/settings`, `/dashboard/emergency/[patientId]`

**Missing routes:** `/register` (no self-service signup at all), `/forgot-password`, all `/admin/*` routes, all care-plan / records / medications / messages routes.

## 3. Auth and session handling

- Supabase Auth (email+password), `@supabase/ssr` cookie sessions, middleware guards `/dashboard/*`. **Working.**
- `handle_new_user` trigger auto-creates profile on signup, **reading `role` from user-supplied signup metadata — privilege-escalation risk (see VAULTA_SECURITY_REVIEW.md, C-1).**
- No signup UI. The invite page links to `/auth/login?signup=true`, but `LoginForm` has no signup mode. **New patients and new caregivers cannot register. Broken end-to-end.**
- No password reset. No MFA enrolment (Settings shows MFA status read-only).

## 4. Database (from `supabase/migrations/`, live DB not verifiable — see note)

Tables: `profiles`, `patients`, `caregiver_consents`, `health_records`, `medications`, `medication_logs`, `alerts`, `emergency_summaries`, `audit_logs`, `patient_invites`. RLS enabled on all. Two edge functions (`vitals-alert-trigger`, `daily-checkin-reminder`) — both depend on dashboard-side webhook/cron configuration that cannot be verified from the repo.

> **Note:** The connected Supabase MCP account only exposes the MJW org projects; the Vaulta project `hdhmlrabekahvfaivnwl` is not accessible from this session, so live schema/policies/advisors could not be checked. Migration 001 header still references the old project `kgbvmigzlefonzyqlegm`; both example env files also point at the old project. Whether 001+002 were both applied cleanly to the new project is **unverified**.

## 5. Area-by-area classification

| Area | Status | Evidence |
|---|---|---|
| Login/logout/session | Working | `LoginForm.tsx`, `middleware.ts` |
| Registration (caregiver or patient) | **Missing** | No register route; dead `?signup=true` link in `AcceptInviteClient.tsx:146` |
| Role model / multi-role | **Missing** | Single `role` column on `profiles`; no role switching; no `user_roles` |
| Master admin (`mornay22@gmail.com`) | **Missing** | `admin` enum value exists; nothing assigns it; no admin UI; no backend bootstrap |
| Family vault | **Missing** | No `families`/`vaults` tables; implicit "one caregiver's patients" only |
| Patient records CRUD (caregiver) | Partially working | Invite form creates patient; **no edit UI for allergies, blood type, contacts, conditions** |
| Medical records / documents | **Missing** | No storage buckets, no upload code, no diagnoses/lab/clinical-note tables anywhere in repo |
| Medication tracking | Frontend-only for caregivers | Tables + mobile "mark taken" work; **no UI anywhere to add a medication**, and RLS blocks caregivers from inserting medications (patient-only policy) |
| Refill / script reminders | **Missing** | No refill/renewal columns or tables; no reminder logic |
| Emergency summary | Partially working + **broken** | Web page exists; crashes for caregiver-created patients (`page.tsx:62` derefs null `profile`); no UI to edit `emergency_summaries`; mobile has **no emergency card screen** |
| Care plans / appointments / timelines | **Missing** | No tables, no UI |
| Allergy & alert system | Partially working | Allergies shown; vitals/SOS/check-in alerts real; **no UI to add/edit allergies**; no severity/reaction/contraindication model |
| Messaging caregiver↔patient | **Missing** | No tables, no UI |
| Health logging (vitals, mood, symptoms) | Working (code level) | Mobile check-in inserts `health_records`; realtime feeds caregiver dashboard |
| SOS | Working (code level) | Inserts critical alert; caregiver sees via realtime |
| Invitations | Partially working | Create + accept flow implemented; **accept does not verify invitee email**; new-user path dead (no signup) |
| Consent | Partially working | `caregiver_consents` row auto-created **by the caregiver**, not by patient action; no revoke UI on web (mobile profile has revoke); no scope UI |
| Audit logs | Partially working | Only 3 action types logged (invite created/accepted, emergency view); page shows own rows only; IP/user-agent columns never populated; insert policy `with check (true)` lets any user forge entries |
| Tests | **Missing** | Zero test files in repo |
| Type safety | Security-adjacent risk | `packages/types` DB types are stale (no `patient_invites`, no new patient columns) → `(supabase as any)` casts across web; mobile type-check fails with `never` types |
| Mock data / placeholders | Present | Settings: notification toggles, "Change password", "Sign out all" are dead controls; overview `VitalsChart data={[]}` always empty |
| Console errors / broken flows | Present | Emergency page crash (above); dashboard shows "Unknown" for caregiver-created patients (`dashboard/page.tsx` name lookup uses profiles only, ignores `first_name`/`last_name`) |

## 6. Verification commands (run 2026-07-02)

| Command | Result |
|---|---|
| `pnpm type-check` (workspace) | **FAIL** — web passes; desktop 4 errors (missing `vite/client` types, 2 undefined-object errors in `useSupabaseData.ts:78-79`); mobile ~15 errors (stale `Database` types → `never`, React 19 type mismatch with expo-router/ionicons) |
| `pnpm build` (web) | See VAULTA_COMPLETION_REPORT.md (run during audit) |
| `pnpm lint` | Not configured with meaningful rules in apps (needs setup) |
| `pnpm test` | No test runner configured, no tests exist |

Blocking? Web deploys today because Vercel builds only `apps/web`. Mobile and desktop are **not shippable** in current state.

## 7. Environment variables

- Web: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server-only, used correctly in `lib/supabase/admin.ts`), `NEXT_PUBLIC_SITE_URL`.
- Mobile: `EXPO_PUBLIC_SUPABASE_URL/ANON_KEY`. Desktop: `VITE_SUPABASE_URL/ANON_KEY`.
- No service-role key found in any client bundle or tracked file. ✅
- `.env.local.example` files (tracked) contain the **old** project URL + anon key — stale, should be updated to placeholders.

## 8. Top-line conclusion

The repo is a solid **remote-patient-monitoring MVP** (vitals check-ins, medication log marking, SOS, alerts) — but the website sells a **family health vault** (records, documents, care plans, scripts, consent-first privacy). Roughly half of the advertised feature set has no code behind it, self-service signup does not exist, and there is no master admin. Details and fixes: see the companion audit files.
