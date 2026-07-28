-- Phase 1a: Supabase Auth profile foundation.
-- Legacy user records remain in public.users until the cutover is complete.

create schema if not exists private;
revoke all on schema private from public;

create type public.app_role as enum (
  'USER',
  'SUPERVISOR',
  'SAFETY_MANAGER',
  'ADMIN',
  'PROJECT_ADMIN'
);

create type public.profile_status as enum ('ACTIVE', 'SUSPENDED', 'DISABLED');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique check (char_length(username) between 3 and 50),
  name text not null check (char_length(name) between 1 and 50),
  contact_email text,
  phone_number text unique,
  role public.app_role not null default 'USER',
  status public.profile_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_role_idx on public.profiles (role);
create index profiles_status_idx on public.profiles (status);

-- User metadata only initializes non-authorisation fields. Role and status use
-- database defaults and are never taken from user-editable metadata.
create function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, username, name, contact_email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'contact_email'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure private.handle_new_user();

create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure private.set_updated_at();
