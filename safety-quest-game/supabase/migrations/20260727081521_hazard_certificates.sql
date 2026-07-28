create table public.hazard_certificates (
  id uuid primary key default gen_random_uuid(),
  cycle_id uuid not null unique references public.hazard_cycles(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null unique,
  created_at timestamptz not null default now()
);

alter table public.hazard_certificates enable row level security;
create policy "hazard certificates: owner or manager reads" on public.hazard_certificates
  for select to authenticated
  using ((select auth.uid()) = user_id or (select private.is_manager()));
grant select on public.hazard_certificates to authenticated;
grant all on public.hazard_certificates to service_role;
