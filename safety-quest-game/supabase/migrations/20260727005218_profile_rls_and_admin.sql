-- Phase 1b: profile access control and administrator role changes.

create function private.user_role()
returns public.app_role
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.profiles where id = (select auth.uid());
$$;

create function private.is_manager()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select private.user_role() in ('SUPERVISOR', 'SAFETY_MANAGER', 'ADMIN', 'PROJECT_ADMIN')), false);
$$;

create function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select private.user_role() in ('ADMIN', 'PROJECT_ADMIN')), false);
$$;

revoke all on all functions in schema private from public;
grant usage on schema private to authenticated;
grant execute on function private.user_role(), private.is_manager(), private.is_admin() to authenticated;

alter table public.profiles enable row level security;

create policy "profiles: users read own profile; managers read all"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id or (select private.is_manager()));

create policy "profiles: users update their own permitted fields"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (username, name, contact_email, phone_number) on public.profiles to authenticated;
grant all on public.profiles to service_role;

create function public.admin_set_role(target_user_id uuid, new_role public.app_role)
returns public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  updated_profile public.profiles;
begin
  if not (select private.is_admin()) then
    raise exception 'admin role is required' using errcode = '42501';
  end if;

  update public.profiles
  set role = new_role
  where id = target_user_id
  returning * into updated_profile;

  if updated_profile is null then
    raise exception 'profile not found' using errcode = 'P0002';
  end if;

  return updated_profile;
end;
$$;

revoke all on function public.admin_set_role(uuid, public.app_role) from public, anon;
grant execute on function public.admin_set_role(uuid, public.app_role) to authenticated;
