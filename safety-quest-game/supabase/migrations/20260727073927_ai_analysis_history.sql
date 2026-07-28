-- Persisted user-scoped AI assessments and follow-up actions.
create table public.ai_analysis_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  analysis_id text not null unique,
  input_text text not null,
  input_type text not null,
  context jsonb not null default '{}'::jsonb,
  result jsonb not null,
  action_taken text,
  action_status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index ai_analysis_history_user_created_idx on public.ai_analysis_history(user_id, created_at desc);
create trigger ai_analysis_history_set_updated_at before update on public.ai_analysis_history for each row execute function private.set_updated_at();
alter table public.ai_analysis_history enable row level security;
create policy "ai analysis: user reads own" on public.ai_analysis_history for select to authenticated using ((select auth.uid())=user_id);
grant select on public.ai_analysis_history to authenticated;
grant all on public.ai_analysis_history to service_role;
