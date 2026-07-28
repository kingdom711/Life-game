create table public.user_game_profiles (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  level integer not null default 1 check (level >= 1),
  exp integer not null default 0 check (exp >= 0),
  exp_to_next integer not null default 100 check (exp_to_next > 0),
  game_role text,
  active_specialization text,
  total_quests_completed integer not null default 0 check (total_quests_completed >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_points (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  balance integer not null default 0 check (balance >= 0),
  total_earned integer not null default 0 check (total_earned >= 0),
  total_spent integer not null default 0 check (total_spent >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_streaks (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  current_streak integer not null default 0 check (current_streak >= 0),
  longest_streak integer not null default 0 check (longest_streak >= 0),
  last_check_in_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create function private.initialize_game_data()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.user_game_profiles (user_id) values (new.id) on conflict do nothing;
  insert into public.user_points (user_id) values (new.id) on conflict do nothing;
  insert into public.user_streaks (user_id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

create trigger profiles_initialize_game_data
  after insert on public.profiles for each row execute procedure private.initialize_game_data();

alter table public.user_game_profiles enable row level security;
alter table public.user_points enable row level security;
alter table public.user_streaks enable row level security;

create policy "game profile: user or manager reads" on public.user_game_profiles
  for select to authenticated using ((select auth.uid()) = user_id or (select private.is_manager()));
create policy "points: user or manager reads" on public.user_points
  for select to authenticated using ((select auth.uid()) = user_id or (select private.is_manager()));
create policy "streak: user or manager reads" on public.user_streaks
  for select to authenticated using ((select auth.uid()) = user_id or (select private.is_manager()));

grant select on public.user_game_profiles, public.user_points, public.user_streaks to authenticated;
grant all on public.user_game_profiles, public.user_points, public.user_streaks to service_role;
