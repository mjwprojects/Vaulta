-- ============================================================
-- Vaulta 2.0 — 003 Auth Hardening & Master Admin
-- Run this in: https://supabase.com/dashboard/project/hdhmlrabekahvfaivnwl/sql/new
--
-- Closes (see VAULTA_SECURITY_REVIEW.md):
--   C-1  role self-selection at signup (admin escalation)
--   H-1  forgeable audit_logs inserts
--   H-2  open alerts inserts (fake SOS)
--   H-4  caregiver self-granted consents (policy dropped; consent
--        is now created server-side at invite acceptance)
--   M-1  profiles role change via UPDATE
--   M-2  patients caregiver update without WITH CHECK
-- Adds: master admin bootstrap (mornay22@gmail.com) + admin read policies.
--
-- Rollback notes at the bottom.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Signup trigger: whitelist roles — 'admin' can never be
--    claimed via signup metadata (C-1).
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_role user_role;
begin
  v_role := case new.raw_user_meta_data->>'role'
    when 'patient'   then 'patient'::user_role
    when 'caregiver' then 'caregiver'::user_role
    else 'caregiver'::user_role
  end;

  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    v_role
  );
  return new;
end;
$$;

-- ------------------------------------------------------------
-- 2. Block role changes through the API (M-1 / C-1 second path).
--    Direct SQL (dashboard/service role) has no 'authenticated'
--    JWT claim, so admin ops still work.
-- ------------------------------------------------------------
create or replace function public.prevent_role_self_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role
     and coalesce(auth.role(), '') = 'authenticated' then
    raise exception 'Role changes are not permitted';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_prevent_role_change on public.profiles;
create trigger profiles_prevent_role_change
  before update on public.profiles
  for each row execute function public.prevent_role_self_change();

-- ------------------------------------------------------------
-- 3. Master admin bootstrap (idempotent).
-- ------------------------------------------------------------
update public.profiles
   set role = 'admin'
 where lower(email) = 'mornay22@gmail.com';

-- Helper used by admin policies (SECURITY DEFINER avoids RLS recursion)
create or replace function public.is_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ------------------------------------------------------------
-- 4. Lock down audit_logs inserts (H-1). Server code writes via
--    the service role, which bypasses RLS — no client inserts.
-- ------------------------------------------------------------
drop policy if exists "System inserts audit logs" on public.audit_logs;

-- ------------------------------------------------------------
-- 5. Scope alerts inserts (H-2): patients may raise alerts for
--    themselves (SOS); edge functions use the service role.
-- ------------------------------------------------------------
drop policy if exists "System can insert alerts" on public.alerts;

create policy "Patients insert own alerts"
  on public.alerts for insert
  with check (
    exists (
      select 1 from public.patients
      where id = patient_id and profile_id = auth.uid()
    )
  );

-- Patients may read their own alerts (mobile)
drop policy if exists "Patients read own alerts" on public.alerts;
create policy "Patients read own alerts"
  on public.alerts for select
  using (
    exists (
      select 1 from public.patients
      where id = patient_id and profile_id = auth.uid()
    )
  );

-- ------------------------------------------------------------
-- 6. Consent semantics (H-4): caregivers may no longer create
--    consent rows for themselves. Consent is created by the
--    server (service role) when a patient accepts an invite.
--    Caregiver access to patients they created directly now
--    flows through patients.caregiver_id ownership instead.
-- ------------------------------------------------------------
drop policy if exists "Caregivers can insert own consents" on public.caregiver_consents;

create or replace function public.has_caregiver_access(p_patient_id uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.caregiver_consents
    where caregiver_id = auth.uid()
      and patient_id   = p_patient_id
      and status       = 'active'
  )
  or exists (
    select 1 from public.patients
    where id = p_patient_id
      and caregiver_id = auth.uid()
  );
$$;

-- ------------------------------------------------------------
-- 7. WITH CHECK on caregiver patient updates (M-2): a caregiver
--    cannot hand their patients to another caregiver_id.
-- ------------------------------------------------------------
drop policy if exists "Caregivers can update patients they manage" on public.patients;
create policy "Caregivers can update patients they manage"
  on public.patients for update
  using (caregiver_id = auth.uid())
  with check (caregiver_id = auth.uid());

-- ------------------------------------------------------------
-- 8. Admin read policies (platform oversight, read-only).
-- ------------------------------------------------------------
drop policy if exists "Admins view all profiles" on public.profiles;
create policy "Admins view all profiles"
  on public.profiles for select using (public.is_admin());

drop policy if exists "Admins view all patients" on public.patients;
create policy "Admins view all patients"
  on public.patients for select using (public.is_admin());

drop policy if exists "Admins view all consents" on public.caregiver_consents;
create policy "Admins view all consents"
  on public.caregiver_consents for select using (public.is_admin());

drop policy if exists "Admins view all invites" on public.patient_invites;
create policy "Admins view all invites"
  on public.patient_invites for select using (public.is_admin());

-- (An "Admins view all audit logs" select policy already exists from 001.)

-- ============================================================
-- ROLLBACK NOTES (manual)
--   1. handle_new_user: restore 001 version (accepts metadata role).
--   2. drop trigger profiles_prevent_role_change on public.profiles;
--      drop function public.prevent_role_self_change();
--   3. update public.profiles set role='caregiver'
--       where lower(email)='mornay22@gmail.com';
--      drop function public.is_admin(); (drop admin policies first)
--   4. create policy "System inserts audit logs" on public.audit_logs
--       for insert with check (true);
--   5. create policy "System can insert alerts" on public.alerts
--       for insert with check (true);
--      drop policy "Patients insert own alerts" / "Patients read own alerts";
--   6. create policy "Caregivers can insert own consents"
--       on public.caregiver_consents for insert
--       with check (caregiver_id = auth.uid());
--      restore 001 has_caregiver_access (consents-only).
--   7. restore 002 update policy without WITH CHECK.
--   8. drop the four "Admins view all ..." policies.
-- ============================================================
