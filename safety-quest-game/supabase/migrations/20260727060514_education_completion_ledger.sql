alter table public.education_courses
  add column point_reward integer not null default 50 check (point_reward >= 0),
  add column exp_reward integer not null default 20 check (exp_reward >= 0);

create table public.education_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  education_id text not null references public.education_courses(id),
  quiz_score integer not null check (quiz_score between 0 and 100),
  watch_seconds integer not null check (watch_seconds >= 0),
  completed_at timestamptz not null default now(),
  certificate_number text not null unique,
  integrity_hash text not null,
  unique (user_id, education_id)
);
alter table public.education_completions enable row level security;
create policy "education completions: user or manager reads" on public.education_completions
  for select to authenticated using ((select auth.uid()) = user_id or (select private.is_manager()));
grant select on public.education_completions to authenticated;
grant all on public.education_completions to service_role;

create or replace function public.complete_education(p_education_id text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_user_id uuid := auth.uid(); v_course public.education_courses; v_watch integer;
  v_attempt integer; v_correct integer; v_total integer; v_score integer; v_balance integer;
  v_completion public.education_completions;
begin
  if v_user_id is null then raise exception 'Authentication is required' using errcode = '28000'; end if;
  select * into v_course from public.education_courses where id = p_education_id and is_active;
  if not found then raise exception 'Education course was not found' using errcode = 'P0002'; end if;
  select max_checkpoint_sec into v_watch from public.education_watch_progress where user_id=v_user_id and education_id=p_education_id;
  if coalesce(v_watch,0) < v_course.required_watch_sec then raise exception 'Required watch evidence is incomplete' using errcode = 'P0001'; end if;
  select max(attempt_number) into v_attempt from public.education_quiz_answer_logs where user_id=v_user_id and education_id=p_education_id;
  if v_attempt is null then raise exception 'Quiz submission was not found' using errcode = 'P0001'; end if;
  select count(*), count(*) filter (where l.selected_option=q.correct_option) into v_total,v_correct
  from public.education_quiz_answer_logs l join private.education_quiz_answers q on q.education_id=l.education_id and q.question_id=l.question_id
  where l.user_id=v_user_id and l.education_id=p_education_id and l.attempt_number=v_attempt;
  if v_total = 0 then raise exception 'Quiz answers were not found' using errcode = 'P0001'; end if;
  v_score := round(100.0*v_correct/v_total);
  if v_score < v_course.required_score then raise exception 'Quiz score does not meet the requirement' using errcode = 'P0001'; end if;
  insert into public.education_completions(user_id,education_id,quiz_score,watch_seconds,certificate_number,integrity_hash)
  values(v_user_id,p_education_id,v_score,v_watch,'SQ-'||to_char(now(),'YYYYMMDD')||'-'||substr(replace(gen_random_uuid()::text,'-',''),1,12),
    encode(extensions.digest(v_user_id::text||p_education_id||v_score::text||v_watch::text||clock_timestamp()::text,'sha256'),'hex'))
  on conflict(user_id,education_id) do nothing returning * into v_completion;
  if not found then
    select * into v_completion from public.education_completions where user_id=v_user_id and education_id=p_education_id;
    return jsonb_build_object('alreadyCompleted',true,'completionId',v_completion.id,'certificateNumber',v_completion.certificate_number,'score',v_completion.quiz_score);
  end if;
  update public.user_points set balance=balance+v_course.point_reward,total_earned=total_earned+v_course.point_reward,updated_at=now() where user_id=v_user_id returning balance into v_balance;
  insert into public.point_transactions(user_id,amount,transaction_type,reason,description,balance_after)
  values(v_user_id,v_course.point_reward,'EARN','EDUCATION_COMPLETION',v_course.title,v_balance);
  return jsonb_build_object('alreadyCompleted',false,'completionId',v_completion.id,'certificateNumber',v_completion.certificate_number,'score',v_score,'pointsAwarded',v_course.point_reward,'balance',v_balance);
end; $$;
revoke all on function public.complete_education(text) from public, anon;
grant execute on function public.complete_education(text) to authenticated;
