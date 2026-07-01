-- ============================================================
-- Vaulta 2.0 — Patient Invites
-- ============================================================

-- Make profile_id nullable so caregivers can create patients
-- who are managed directly (no patient login required)
ALTER TABLE public.patients
  ALTER COLUMN profile_id DROP NOT NULL;

-- Add caregiver_id to patients so we know who created/manages them
ALTER TABLE public.patients
  ADD COLUMN IF NOT EXISTS caregiver_id uuid references public.profiles(id) on delete set null,
  ADD COLUMN IF NOT EXISTS status text not null default 'active'
    check (status in ('active', 'inactive', 'archived')),
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS medical_aid_name text,
  ADD COLUMN IF NOT EXISTS medical_aid_number text,
  ADD COLUMN IF NOT EXISTS notes text;

CREATE INDEX IF NOT EXISTS patients_caregiver_idx ON public.patients(caregiver_id);
CREATE INDEX IF NOT EXISTS patients_status_idx    ON public.patients(status);

-- ============================================================
-- PATIENT INVITES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.patient_invites (
  id                  uuid primary key default gen_random_uuid(),
  token               uuid not null unique default gen_random_uuid(),
  caregiver_id        uuid not null references public.profiles(id) on delete cascade,
  patient_id          uuid references public.patients(id) on delete cascade,

  -- Patient info collected at invite time
  first_name          text not null,
  last_name           text not null,
  email               text not null,
  date_of_birth       date not null,
  primary_condition   text,

  -- Invite lifecycle
  status              text not null default 'pending'
    check (status in ('pending', 'accepted', 'revoked', 'expired')),
  expires_at          timestamptz not null default (now() + interval '7 days'),
  accepted_at         timestamptz,
  last_viewed_at      timestamptz,
  view_count          integer not null default 0,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

CREATE INDEX IF NOT EXISTS patient_invites_token_idx       ON public.patient_invites(token);
CREATE INDEX IF NOT EXISTS patient_invites_caregiver_idx   ON public.patient_invites(caregiver_id);
CREATE INDEX IF NOT EXISTS patient_invites_email_idx       ON public.patient_invites(email);
CREATE INDEX IF NOT EXISTS patient_invites_status_idx      ON public.patient_invites(status);

CREATE TRIGGER patient_invites_updated_at
  BEFORE UPDATE ON public.patient_invites
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- RLS for patient_invites
-- ============================================================
ALTER TABLE public.patient_invites ENABLE ROW LEVEL SECURITY;

-- Caregivers can manage their own invites
CREATE POLICY "Caregivers manage own invites"
  ON public.patient_invites FOR ALL
  USING (caregiver_id = auth.uid());

-- Anyone with the token can view a pending/non-expired invite (for acceptance page)
-- This is enforced in the app layer via service role; anon reads are blocked.

-- ============================================================
-- RLS updates for patients (allow caregiver_id access)
-- ============================================================
CREATE POLICY "Caregivers can insert patients they manage"
  ON public.patients FOR INSERT
  WITH CHECK (caregiver_id = auth.uid());

CREATE POLICY "Caregivers can update patients they manage"
  ON public.patients FOR UPDATE
  USING (caregiver_id = auth.uid());

-- ============================================================
-- Audit log additions
-- ============================================================
-- Ensure audit_logs can store invite actions (no schema change needed,
-- resource_type text column already exists)
