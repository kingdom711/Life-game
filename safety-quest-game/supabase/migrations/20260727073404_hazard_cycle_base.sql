-- Hazard discovery, AI assessment, remediation and peer acknowledgement records.
create table public.hazard_cycles (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  hazard_photo_path text not null,
  hazard_description text,
  location_description text,
  reported_at timestamptz not null default now(),
  ai_analysis jsonb not null default '{}'::jsonb,
  ai_analyzed_at timestamptz,
  status text not null default 'AI_ANALYZED'
    check (status in ('HAZARD_REPORTED', 'AI_ANALYZED', 'ACTION_COMPLETED', 'EXPIRED', 'REJECTED')),
  completion_photo_path text,
  completion_note text,
  completed_at timestamptz,
  tier1_points_awarded integer not null default 100 check (tier1_points_awarded >= 0),
  tier1_awarded_at timestamptz,
  tier2_points_awarded integer not null default 0 check (tier2_points_awarded >= 0),
  tier2_awarded_at timestamptz,
  client_temp_id text,
  synced_from_offline boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (reporter_id, client_temp_id)
);
create index hazard_cycles_reporter_reported_idx on public.hazard_cycles(reporter_id, reported_at desc);
create index hazard_cycles_status_idx on public.hazard_cycles(status, reported_at desc);

create table public.hazard_cycle_acks (
  id uuid primary key default gen_random_uuid(),
  cycle_id uuid not null references public.hazard_cycles(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  comment text,
  created_at timestamptz not null default now(),
  unique (cycle_id, user_id)
);
create index hazard_cycle_acks_cycle_created_idx on public.hazard_cycle_acks(cycle_id, created_at);

create trigger hazard_cycles_set_updated_at
before update on public.hazard_cycles
for each row execute function private.set_updated_at();

alter table public.hazard_cycles enable row level security;
alter table public.hazard_cycle_acks enable row level security;

create policy "hazard cycles: reporter or manager reads" on public.hazard_cycles
for select to authenticated
using ((select auth.uid()) = reporter_id or (select private.is_manager()));
create policy "hazard cycle acks: signed-in users read" on public.hazard_cycle_acks
for select to authenticated using (true);

grant select on public.hazard_cycles, public.hazard_cycle_acks to authenticated;
grant all on public.hazard_cycles, public.hazard_cycle_acks to service_role;
