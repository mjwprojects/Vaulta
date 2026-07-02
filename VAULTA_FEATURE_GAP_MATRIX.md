# VAULTA_FEATURE_GAP_MATRIX.md

Status legend: ✅ Working · 🟡 Partial · 🔵 Frontend-only · 🔴 Broken · ⬜ Missing · 🔐 Security risk · 🧪 Needs testing

## Master admin (brief §7.1)

| Capability | Status | Notes |
|---|---|---|
| `mornay22@gmail.com` bootstrapped as admin | ⬜ | Nothing assigns `admin` role; needs migration/seed |
| Platform admin dashboard | ⬜ | No `/admin` routes |
| User/caregiver/invitation review | ⬜ | — |
| System health view | ⬜ | — |
| Admin not blocked by invite logic | 🧪 | Untestable until admin exists |
| Backend-enforced admin role | 🔐 | Worse: any API signup can claim `admin` via metadata (see security review C-1) |

## Caregiver (brief §7.2)

| Capability | Status | Notes |
|---|---|---|
| Caregiver registration | ⬜ | No signup UI at all |
| Caregiver profile setup | 🟡 | Settings can edit full name only |
| Create/manage family vaults | ⬜ | No vault concept |
| Add patients | ✅ | Via invite form (creates patient + consent + invite) |
| Complete patient details (allergies, blood type, contacts, medical aid) | ⬜ | Columns exist; no edit UI |
| Upload/manage medical records | ⬜ | No storage, no UI |
| Add/track medication | 🔴 | View-only; no add UI and RLS blocks caregiver inserts |
| Scripts / refill / renewal dates | ⬜ | No schema, no UI |
| Appointments | ⬜ | No schema, no UI |
| Care plans | ⬜ | No schema, no UI |
| Allergies & alert flags | 🟡 | Display only; no CRUD |
| View patient logs | ✅ | Patient detail: vitals table, chart, realtime inserts |
| Receive patient updates | ✅ | Realtime alerts + health records subscriptions |
| Message patients | ⬜ | No messaging anywhere |
| Invite patients | 🟡 | Works for existing accounts; dead-end for new users (no signup) |
| Unlimited patients | ✅ | No artificial limits found |

## Patient / family member (brief §7.3)

| Capability | Status | Notes |
|---|---|---|
| Accept invite link | 🟡 | Works if already registered; new users blocked; email not verified 🔐 |
| Create own profile | 🔴 | No signup path |
| Patient mobile experience | 🟡 | Expo app exists, works in dev, **type-check fails**, not published; web has no patient mode |
| View own vault info | 🟡 | Mobile home shows meds/status; no records/documents (none exist) |
| Log readings | ✅ | Daily check-in (vitals, mood, pain, symptoms, notes) |
| Upload documents | ⬜ | — |
| Track scripts/medication | 🟡 | Mark taken/skip works; no schedules generated (no `medication_logs` are ever created by any code path — 🧪 who inserts the scheduled doses?) |
| Daily check-ins | ✅ | Plus missed-check-in cron alert (needs dashboard cron config 🧪) |
| View care instructions | ⬜ | — |
| Message caregiver | ⬜ | — |
| View appointments | ⬜ | — |
| Emergency summary / card | ⬜ on mobile; 🔴 on web (crash for unlinked patients) |
| SOS | ✅ | Creates critical alert for caregivers |

## Multi-role (brief §7.4)

| Capability | Status | Notes |
|---|---|---|
| One account, multiple roles | ⬜ | Single `role` enum on profile; accepting a patient invite while caregiver leaves role untouched (accident, not design) |
| Role switching / context | ⬜ | Web always shows caregiver dashboard; mobile always patient |
| Caregiver can accept patient invite | 🟡 | Technically possible; lands them in caregiver dashboard afterwards (confusing) |

## Platform plumbing

| Item | Status | Notes |
|---|---|---|
| Vitals threshold alert engine | ✅ (code) 🧪 (webhook config unverified) | `vitals-alert-trigger` edge function |
| Daily check-in reminder | ✅ (code) 🧪 (cron config unverified) | `daily-checkin-reminder` |
| Realtime updates | ✅ | alerts, health_records, medication_logs publications |
| Audit logging | 🟡 🔐 | 3 actions only; forgeable inserts; IP never captured |
| DB types package | 🔴 | Stale — missing `patient_invites` + new patient columns; causes `as any` everywhere and mobile `never` errors |
| Tests | ⬜ | Zero tests in repo |
| Desktop app | 🔴 | Type-check fails; duplicates web dashboard — recommend de-scoping |

## The three biggest functional holes (build order input)

1. **No self-service registration** — every flow that starts with a new user is dead. Smallest fix with the biggest unblock.
2. **No medication add/schedule path** — the flagship monitoring loop has no way to get data in (no code inserts `medication_logs`).
3. **No documents/records, care plans, or messaging** — three advertised modules with zero schema.
