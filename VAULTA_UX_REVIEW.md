# VAULTA_UX_REVIEW.md

## 1. Structural UX findings

| # | Finding | Impact | Fix |
|---|---|---|---|
| 1 | **No role-aware routing.** Patients who log in on web get the caregiver dashboard shell (sidebar: Patients, Alerts, Audit Log) showing only themselves. Brief §17 UX rule violated. | High — confusing, undermines "patient mobile experience" positioning | After login, branch on role: patient → mobile-first patient view (or holding page pointing to app); caregiver → dashboard |
| 2 | **New-user dead end.** "Create one for free" on the invite page → `/auth/login?signup=true` → plain login form. No `/register`. | Critical — invited family members literally cannot join | Build signup (with invite-token awareness) |
| 3 | **Caregiver-created patients render as "Unknown"** on the overview (`dashboard/page.tsx` uses profile names only; ignores `first_name`/`last_name` added in migration 002; patient detail already handles this via `patientDisplayName`). | Medium — looks broken on day one | Reuse `patientDisplayName` logic in overview + emergency page |
| 4 | **Emergency page crashes** for caregiver-managed patients (null `profile.full_name`). | High — the "seconds count" page 500s | Null-safe name + fix audit insert |
| 5 | **Dead controls in Settings**: notification toggles (static), "Change password", "Sign out all" buttons do nothing. Brief §25: no placeholder buttons. | Medium — trust erosion | Wire or remove |
| 6 | **Overview vitals chart is always empty** (`<VitalsChart data={[]} />`). | Low-medium | Feed it aggregate data or remove until real |
| 7 | **No way to enter core data.** No UI to add medications, allergies, blood type, emergency contacts, conditions, or emergency summaries — every showcase screen depends on data that can only arrive via SQL. | Critical for demo/real use | Phase 4–5 CRUD forms |
| 8 | **Medication schedule engine missing** — mobile med screen reads `medication_logs` but no code ever creates the daily dose rows; patients will always see "No medications scheduled". | High | Schedule generator (cron or on-add fan-out) |
| 9 | **Mobile has no emergency card tab** despite it being the marquee mobile promise. SOS exists; the card doesn't. | High | Add `/patient/emergency-card` equivalent tab |
| 10 | Audit page shows only the viewer's own actions but is titled "Immutable record of all data access and actions". | Low | Retitle ("Your activity") until admin view exists |

## 2. Caregiver dashboard vs brief §16 modules

Present: patient list, critical alerts, recent readings, invitations (create only), patient file (vitals, meds view, alerts, emergency info).
Missing: vault overview, upcoming appointments, script/refill renewals, missed check-ins panel (alert exists, no panel), recent documents, care plans requiring action, messages/unread, invitation status list (pending/accepted table).

## 3. Patient mobile vs brief §17 modules

Present: today dashboard (home), sugar/BP/mood/symptom logging (one combined check-in — good simplification), med taken/skip, SOS, profile with consent revoke.
Missing: emergency card, scripts/refills, document upload, appointments, care instructions, messages, medication schedule visibility beyond today.

## 4. Visual/branding notes

- Web dashboard mixes two design systems: landing/login/invite use the dark purple CSS-variable theme; the dashboard inner pages use light `slate` Tailwind styling. Feels like two products.
- Mobile app uses a third palette (blue `#1469f5`) — not the Vaulta purple. Branding docs exist in repo root (`vaulta_branding_document.pdf`) — apply once functionality stabilises. Low priority per brief ("the objective is not visual polish").
- Desktop app duplicates the web dashboard with older code; recommend de-scoping and letting caregivers use the web app (keeps one caregiver surface to maintain).
