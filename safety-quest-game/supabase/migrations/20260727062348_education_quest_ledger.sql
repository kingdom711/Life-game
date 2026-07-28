create table public.user_quest_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  quest_id text not null check (char_length(quest_id) between 1 and 100),
  period_date date not null,
  source_type text not null check (source_type in ('EDUCATION_COMPLETION')),
  source_id uuid not null unique references public.education_completions(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique(user_id, quest_id, period_date)
);
alter table public.user_quest_completions enable row level security;
create policy "quest completions: user or manager reads" on public.user_quest_completions
  for select to authenticated using ((select auth.uid())=user_id or (select private.is_manager()));
grant select on public.user_quest_completions to authenticated;
grant all on public.user_quest_completions to service_role;

create or replace function private.record_education_daily_quest()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.user_quest_completions(user_id,quest_id,period_date,source_type,source_id)
  values(new.user_id,'daily_education_1',(new.completed_at at time zone 'Asia/Seoul')::date,'EDUCATION_COMPLETION',new.id)
  on conflict(user_id,quest_id,period_date) do nothing;
  return new;
end; $$;
create trigger education_completion_records_daily_quest
after insert on public.education_completions for each row execute procedure private.record_education_daily_quest();
