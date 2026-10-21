-- Administrator-approved password resets.
--
-- Supabase Auth's own recovery e-mail flow lets a user change their password
-- unattended. This project requires an administrator to approve the change
-- first, so the requested password is parked here until it is approved.
--
-- The requested password is never stored in clear text and is never reachable
-- through the Data API: the password-reset-approval Edge Function encrypts it
-- (AES-GCM, key from the function's PASSWORD_RESET_ENCRYPTION_KEY secret),
-- writes it with the service role, and clears the column as soon as the
-- request is approved or rejected.

create table public.password_reset_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  requested_email text not null check (char_length(requested_email) between 3 and 320),
  encrypted_new_password text check (char_length(encrypted_new_password) <= 4000),
  status text not null default 'PENDING' check (status in ('PENDING', 'APPROVED', 'REJECTED')),
  reject_reason text check (char_length(reject_reason) <= 255),
  processed_by uuid references public.profiles(id),
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

-- A later request supersedes the previous one, so at most one stays pending.
create unique index password_reset_requests_one_pending_per_user_idx
  on public.password_reset_requests (user_id)
  where status = 'PENDING';
create index password_reset_requests_status_created_idx
  on public.password_reset_requests (status, created_at desc);

alter table public.password_reset_requests enable row level security;

-- No policy is granted on purpose. Even with row level security a select
-- policy would expose encrypted_new_password to its owner, so every read goes
-- through public.list_password_reset_requests() and every write through the
-- Edge Function's service-role client.
revoke all on public.password_reset_requests from anon, authenticated;
grant all on public.password_reset_requests to service_role;

-- Administrator-facing list. Returns the approval queue without the encrypted
-- password column.
create or replace function public.list_password_reset_requests(p_pending_only boolean default true)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_rows jsonb;
begin
  if not (select private.is_admin()) then
    raise exception 'Administrator role is required' using errcode = '42501';
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
           'id', r.id,
           'userId', r.user_id,
           'userName', p.name,
           'username', p.username,
           'email', r.requested_email,
           'status', r.status,
           'rejectReason', r.reject_reason,
           'createdAt', r.created_at,
           'processedAt', r.processed_at
         ) order by r.created_at desc), '[]'::jsonb)
    into v_rows
    from public.password_reset_requests r
    join public.profiles p on p.id = r.user_id
   where not coalesce(p_pending_only, true) or r.status = 'PENDING';

  return v_rows;
end;
$$;

revoke all on function public.list_password_reset_requests(boolean) from public, anon;
grant execute on function public.list_password_reset_requests(boolean) to authenticated;

-- Resolves the account a reset request refers to. The sign-in identity may be
-- the auth e-mail, the contact e-mail on the profile, or the username (which
-- maps to <username>@safety-quest.local in auth.users), so all three are
-- matched, in that order of preference.
--
-- Executable by the service role only: exposing it to signed-in users would
-- turn it into an account enumeration oracle.
create or replace function public.find_password_reset_target(p_identity text)
returns uuid
language sql
security definer
set search_path = ''
as $$
  with normalized as (
    select lower(trim(coalesce(p_identity, ''))) as identity
  ),
  candidates as (
    select u.id, 1 as priority
      from auth.users u, normalized n
     where n.identity <> '' and lower(u.email) = n.identity
    union all
    select p.id, 2
      from public.profiles p, normalized n
     where n.identity <> '' and lower(p.contact_email) = n.identity
    union all
    select p.id, 3
      from public.profiles p, normalized n
     where n.identity <> '' and lower(p.username) = n.identity
  )
  select id from candidates order by priority limit 1;
$$;

revoke all on function public.find_password_reset_target(text) from public, anon, authenticated;
grant execute on function public.find_password_reset_target(text) to service_role;
