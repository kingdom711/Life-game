create table public.point_transactions (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  amount integer not null check (amount > 0),
  transaction_type text not null check (transaction_type in ('EARN', 'SPEND')),
  reason text not null,
  description text,
  balance_after integer not null check (balance_after >= 0),
  created_at timestamptz not null default now()
);
create index point_transactions_user_created_idx on public.point_transactions (user_id, created_at desc);

create table public.attendance_records (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  check_in_date date not null,
  points_earned integer not null check (points_earned >= 0),
  streak_at_time integer not null check (streak_at_time >= 1),
  created_at timestamptz not null default now(),
  unique (user_id, check_in_date)
);

alter table public.point_transactions enable row level security;
alter table public.attendance_records enable row level security;
create policy "point ledger: user or manager reads" on public.point_transactions
  for select to authenticated using ((select auth.uid()) = user_id or (select private.is_manager()));
create policy "attendance: user or manager reads" on public.attendance_records
  for select to authenticated using ((select auth.uid()) = user_id or (select private.is_manager()));
grant select on public.point_transactions, public.attendance_records to authenticated;
grant all on public.point_transactions, public.attendance_records to service_role;
