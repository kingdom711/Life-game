create table public.education_watch_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  education_id text not null check (char_length(education_id) between 1 and 100),
  checkpoint_sec integer not null check (checkpoint_sec >= 0),
  total_sec integer not null check (total_sec > 0 and total_sec <= 28800),
  is_playing boolean not null,
  tab_visible boolean not null,
  server_time timestamptz not null default now()
);

create index education_watch_logs_user_education_time_idx
  on public.education_watch_logs (user_id, education_id, server_time desc);

create table public.education_watch_progress (
  user_id uuid not null references public.profiles (id) on delete cascade,
  education_id text not null check (char_length(education_id) between 1 and 100),
  total_sec integer not null check (total_sec > 0 and total_sec <= 28800),
  max_checkpoint_sec integer not null default 0 check (max_checkpoint_sec >= 0),
  first_checkpoint_at timestamptz not null default now(),
  last_checkpoint_at timestamptz not null default now(),
  primary key (user_id, education_id)
);

create table public.education_quiz_answer_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  education_id text not null check (char_length(education_id) between 1 and 100),
  attempt_number integer not null check (attempt_number between 1 and 20),
  question_id text not null check (char_length(question_id) between 1 and 100),
  selected_option integer not null check (selected_option between 0 and 20),
  time_spent_sec integer check (time_spent_sec between 0 and 3600),
  submitted_at timestamptz not null default now()
);

create index education_quiz_answers_user_education_idx
  on public.education_quiz_answer_logs (user_id, education_id, attempt_number, submitted_at desc);

alter table public.education_watch_logs enable row level security;
alter table public.education_watch_progress enable row level security;
alter table public.education_quiz_answer_logs enable row level security;

create policy "watch logs: user or manager reads" on public.education_watch_logs
  for select to authenticated
  using ((select auth.uid()) = user_id or (select private.is_manager()));
create policy "watch progress: user or manager reads" on public.education_watch_progress
  for select to authenticated
  using ((select auth.uid()) = user_id or (select private.is_manager()));
create policy "quiz logs: user or manager reads" on public.education_quiz_answer_logs
  for select to authenticated
  using ((select auth.uid()) = user_id or (select private.is_manager()));

grant select on public.education_watch_logs, public.education_watch_progress,
  public.education_quiz_answer_logs to authenticated;
grant all on public.education_watch_logs, public.education_watch_progress,
  public.education_quiz_answer_logs to service_role;

create or replace function public.record_education_checkpoint(
  p_education_id text,
  p_checkpoint_sec integer,
  p_total_sec integer,
  p_is_playing boolean,
  p_tab_visible boolean
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_now timestamptz := now();
begin
  if v_user_id is null then
    raise exception 'Authentication is required' using errcode = '28000';
  end if;
  if p_education_id is null or char_length(trim(p_education_id)) not between 1 and 100
     or p_checkpoint_sec is null or p_total_sec is null
     or p_total_sec not between 1 and 28800
     or p_checkpoint_sec not between 0 and p_total_sec then
    raise exception 'Invalid education checkpoint' using errcode = '22023';
  end if;

  insert into public.education_watch_logs
    (user_id, education_id, checkpoint_sec, total_sec, is_playing, tab_visible, server_time)
  values
    (v_user_id, trim(p_education_id), p_checkpoint_sec, p_total_sec,
     coalesce(p_is_playing, false), coalesce(p_tab_visible, false), v_now);

  insert into public.education_watch_progress
    (user_id, education_id, total_sec, max_checkpoint_sec, first_checkpoint_at, last_checkpoint_at)
  values (v_user_id, trim(p_education_id), p_total_sec, p_checkpoint_sec, v_now, v_now)
  on conflict (user_id, education_id) do update
    set total_sec = excluded.total_sec,
        max_checkpoint_sec = greatest(public.education_watch_progress.max_checkpoint_sec,
                                      excluded.max_checkpoint_sec),
        last_checkpoint_at = excluded.last_checkpoint_at;

  return jsonb_build_object('serverTime', v_now, 'checkpointSec', p_checkpoint_sec);
end;
$$;

create or replace function public.record_education_quiz_answers(
  p_education_id text,
  p_attempt_number integer,
  p_answers jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_count integer;
begin
  if v_user_id is null then
    raise exception 'Authentication is required' using errcode = '28000';
  end if;
  if p_education_id is null or char_length(trim(p_education_id)) not between 1 and 100
     or p_attempt_number not between 1 and 20
     or jsonb_typeof(p_answers) <> 'array'
     or jsonb_array_length(p_answers) not between 1 and 20 then
    raise exception 'Invalid quiz submission' using errcode = '22023';
  end if;

  insert into public.education_quiz_answer_logs
    (user_id, education_id, attempt_number, question_id, selected_option, time_spent_sec)
  select v_user_id, trim(p_education_id), p_attempt_number,
         trim(answer.question_id), answer.selected_option, answer.time_spent_sec
  from jsonb_to_recordset(p_answers) as answer(
    question_id text, selected_option integer, time_spent_sec integer
  )
  where char_length(trim(answer.question_id)) between 1 and 100
    and answer.selected_option between 0 and 20
    and (answer.time_spent_sec is null or answer.time_spent_sec between 0 and 3600);

  get diagnostics v_count = row_count;
  if v_count <> jsonb_array_length(p_answers) then
    raise exception 'Invalid quiz answer item' using errcode = '22023';
  end if;
  return jsonb_build_object('savedCount', v_count, 'attemptNumber', p_attempt_number, 'savedAt', now());
end;
$$;

revoke all on function public.record_education_checkpoint(text, integer, integer, boolean, boolean) from public, anon;
revoke all on function public.record_education_quiz_answers(text, integer, jsonb) from public, anon;
grant execute on function public.record_education_checkpoint(text, integer, integer, boolean, boolean) to authenticated;
grant execute on function public.record_education_quiz_answers(text, integer, jsonb) to authenticated;
