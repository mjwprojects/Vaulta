-- ============================================================
-- Vaulta 2.0 — Initial Schema
-- Run this in: https://supabase.com/dashboard/project/kgbvmigzlefonzyqlegm/sql/new
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================
create type user_role       as enum ('patient', 'caregiver', 'admin');
create type blood_type      as enum ('A+','A-','B+','B-','AB+','AB-','O+','O-');
create type mood_level      as enum ('1','2','3','4','5');
create type medication_status as enum ('taken','missed','skipped','pending');
create type alert_type      as enum ('emergency','medication_missed','vital_abnormal','symptom_reported','check_in_missed');
create type alert_severity  as enum ('critical','high','medium','low');
create type alert_status    as enum ('active','acknowledged','resolved','dismissed');
create type access_level    as enum ('full','read_only','emergency_only');
create type consent_status  as enum ('active','revoked','pending');

-- ============================================================
-- PROFILES (mirrors auth.users)
-- ============================================================
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null unique,
  full_name     text not null default '',
  avatar_url    text,
  role          user_role not null default 'caregiver',
  mfa_enabled   boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'caregiver')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- ============================================================
-- PATIENTS
-- ============================================================
create table public.patients (
  id                        uuid primary key default gen_random_uuid(),
  profile_id                uuid not null references public.profiles(id) on delete cascade,
  date_of_birth             date not null,
  blood_type                blood_type,
  allergies                 text[] not null default '{}',
  emergency_contact_name    text,
  emergency_contact_phone   text,
  primary_condition         text,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

create trigger patients_updated_at before update on public.patients
  for each row execute function public.set_updated_at();

create index patients_profile_id_idx on public.patients(profile_id);

-- ============================================================
-- CAREGIVER CONSENTS
-- ============================================================
create table public.caregiver_consents (
  id             uuid primary key default gen_random_uuid(),
  patient_id     uuid not null references public.patients(id) on delete cascade,
  caregiver_id   uuid not null references public.profiles(id) on delete cascade,
  granted_at     timestamptz not null default now(),
  revoked_at     timestamptz,
  access_level   access_level not null default 'read_only',
  status         consent_status not null default 'active',
  created_at     timestamptz not null default now(),
  unique(patient_id, caregiver_id)
);

create index consents_caregiver_idx on public.caregiver_consents(caregiver_id);
create index consents_patient_idx   on public.caregiver_consents(patient_id);

-- ============================================================
-- HEALTH RECORDS
-- ============================================================
create table public.health_records (
  id                          uuid primary key default gen_random_uuid(),
  patient_id                  uuid not null references public.patients(id) on delete cascade,
  recorded_at                 timestamptz not null default now(),
  symptoms                    text[] not null default '{}',
  pain_level                  smallint check (pain_level between 1 and 10),
  blood_pressure_systolic     smallint,
  blood_pressure_diastolic    smallint,
  heart_rate                  smallint,
  temperature                 numeric(4,1),
  oxygen_saturation           smallint check (oxygen_saturation between 50 and 100),
  weight_kg                   numeric(5,1),
  glucose_mmol                numeric(4,1),
  mood                        mood_level,
  notes                       text,
  created_at                  timestamptz not null default now()
);

create index health_records_patient_idx     on public.health_records(patient_id);
create index health_records_recorded_at_idx on public.health_records(recorded_at desc);

-- ============================================================
-- MEDICATIONS
-- ============================================================
create table public.medications (
  id                  uuid primary key default gen_random_uuid(),
  patient_id          uuid not null references public.patients(id) on delete cascade,
  name                text not null,
  dosage              text not null,
  frequency           text not null,
  start_date          date not null,
  end_date            date,
  prescribing_doctor  text,
  notes               text,
  is_active           boolean not null default true,
  created_at          timestamptz not null default now()
);

create index medications_patient_idx on public.medications(patient_id);

-- ============================================================
-- MEDICATION LOGS
-- ============================================================
create table public.medication_logs (
  id              uuid primary key default gen_random_uuid(),
  medication_id   uuid not null references public.medications(id) on delete cascade,
  patient_id      uuid not null references public.patients(id) on delete cascade,
  scheduled_at    timestamptz not null,
  taken_at        timestamptz,
  status          medication_status not null default 'pending',
  notes           text,
  created_at      timestamptz not null default now()
);

create index med_logs_patient_idx     on public.medication_logs(patient_id);
create index med_logs_scheduled_idx   on public.medication_logs(scheduled_at desc);

-- ============================================================
-- ALERTS
-- ============================================================
create table public.alerts (
  id            uuid primary key default gen_random_uuid(),
  patient_id    uuid not null references public.patients(id) on delete cascade,
  type          alert_type not null,
  severity      alert_severity not null,
  title         text not null,
  message       text not null,
  metadata      jsonb not null default '{}',
  status        alert_status not null default 'active',
  resolved_at   timestamptz,
  resolved_by   uuid references public.profiles(id),
  created_at    timestamptz not null default now()
);

create index alerts_patient_idx  on public.alerts(patient_id);
create index alerts_status_idx   on public.alerts(status) where status = 'active';
create index alerts_created_idx  on public.alerts(created_at desc);

-- ============================================================
-- EMERGENCY SUMMARIES
-- ============================================================
create table public.emergency_summaries (
  id                        uuid primary key default gen_random_uuid(),
  patient_id                uuid not null unique references public.patients(id) on delete cascade,
  blood_type                blood_type,
  allergies                 text[] not null default '{}',
  current_medications       text[] not null default '{}',
  critical_conditions       text[] not null default '{}',
  emergency_contact_name    text,
  emergency_contact_phone   text,
  dnr                       boolean not null default false,
  notes                     text,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

create trigger emergency_summaries_updated_at before update on public.emergency_summaries
  for each row execute function public.set_updated_at();

-- ============================================================
-- AUDIT LOGS
-- ============================================================
create table public.audit_logs (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id),
  action          text not null,
  resource_type   text not null,
  resource_id     text not null,
  metadata        jsonb not null default '{}',
  ip_address      inet,
  user_agent      text,
  created_at      timestamptz not null default now()
);

create index audit_user_idx   on public.audit_logs(user_id);
create index audit_action_idx on public.audit_logs(action);
create index audit_time_idx   on public.audit_logs(created_at desc);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles           enable row level security;
alter table public.patients           enable row level security;
alter table public.caregiver_consents enable row level security;
alter table public.health_records     enable row level security;
alter table public.medications        enable row level security;
alter table public.medication_logs    enable row level security;
alter table public.alerts             enable row level security;
alter table public.emergency_summaries enable row level security;
alter table public.audit_logs         enable row level security;

-- Helper: is this user a caregiver with active consent for this patient?
create or replace function public.has_caregiver_access(p_patient_id uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.caregiver_consents
    where caregiver_id = auth.uid()
      and patient_id   = p_patient_id
      and status       = 'active'
  );
$$;

-- PROFILES policies
create policy "Users can view own profile"
  on public.profiles for select using (id = auth.uid());
create policy "Users can update own profile"
  on public.profiles for update using (id = auth.uid());
create policy "Caregivers can view patient profiles they have consent for"
  on public.profiles for select using (
    exists (
      select 1 from public.patients pt
      join public.caregiver_consents cc on cc.patient_id = pt.id
      where pt.profile_id = profiles.id
        and cc.caregiver_id = auth.uid()
        and cc.status = 'active'
    )
  );

-- PATIENTS policies
create policy "Patients can view own record"
  on public.patients for select using (profile_id = auth.uid());
create policy "Patients can update own record"
  on public.patients for update using (profile_id = auth.uid());
create policy "Caregivers can view consented patients"
  on public.patients for select using (public.has_caregiver_access(id));

-- CAREGIVER CONSENTS policies
create policy "Patients manage own consents"
  on public.caregiver_consents for all using (
    exists (select 1 from public.patients where id = patient_id and profile_id = auth.uid())
  );
create policy "Caregivers view own consents"
  on public.caregiver_consents for select using (caregiver_id = auth.uid());

-- HEALTH RECORDS policies
create policy "Patients manage own health records"
  on public.health_records for all using (
    exists (select 1 from public.patients where id = patient_id and profile_id = auth.uid())
  );
create policy "Caregivers read consented health records"
  on public.health_records for select using (public.has_caregiver_access(patient_id));

-- MEDICATIONS policies
create policy "Patients manage own medications"
  on public.medications for all using (
    exists (select 1 from public.patients where id = patient_id and profile_id = auth.uid())
  );
create policy "Caregivers read consented medications"
  on public.medications for select using (public.has_caregiver_access(patient_id));

-- MEDICATION LOGS policies
create policy "Patients manage own medication logs"
  on public.medication_logs for all using (
    exists (select 1 from public.patients where id = patient_id and profile_id = auth.uid())
  );
create policy "Caregivers read consented medication logs"
  on public.medication_logs for select using (public.has_caregiver_access(patient_id));

-- ALERTS policies
create policy "Caregivers read alerts for consented patients"
  on public.alerts for select using (public.has_caregiver_access(patient_id));
create policy "Caregivers update alert status"
  on public.alerts for update using (public.has_caregiver_access(patient_id));
create policy "System can insert alerts"
  on public.alerts for insert with check (true);

-- EMERGENCY SUMMARIES policies
create policy "Patients manage own emergency summary"
  on public.emergency_summaries for all using (
    exists (select 1 from public.patients where id = patient_id and profile_id = auth.uid())
  );
create policy "Caregivers read emergency summaries"
  on public.emergency_summaries for select using (public.has_caregiver_access(patient_id));

-- AUDIT LOGS policies
create policy "Users view own audit logs"
  on public.audit_logs for select using (user_id = auth.uid());
create policy "System inserts audit logs"
  on public.audit_logs for insert with check (true);
create policy "Admins view all audit logs"
  on public.audit_logs for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- REALTIME
-- ============================================================
alter publication supabase_realtime add table public.alerts;
alter publication supabase_realtime add table public.health_records;
alter publication supabase_realtime add table public.medication_logs;
