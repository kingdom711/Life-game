create table public.personal_quest_definitions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (char_length(code) between 3 and 100),
  title text not null check (char_length(title) between 1 and 200),
  description text not null check (char_length(description) between 1 and 1000),
  type text not null check (type in ('DAILY', 'WEEKLY', 'MONTHLY')),
  condition_type text not null check (condition_type in ('ATTENDANCE', 'EDUCATION_COMPLETION', 'CHECKLIST_SUBMISSION', 'CHECKLIST_REVIEW', 'HAZARD_REPORT')),
  target_count integer not null check (target_count between 1 and 1000),
  manager_only boolean not null default false,
  reward_points integer not null default 0 check (reward_points >= 0),
  reward_exp integer not null default 0 check (reward_exp >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.personal_quest_claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  quest_id uuid not null references public.personal_quest_definitions(id) on delete restrict,
  period_key text not null check (char_length(period_key) between 8 and 20),
  claimed_at timestamptz not null default now(),
  unique (user_id, quest_id, period_key)
);
create index personal_quest_claims_user_period_idx on public.personal_quest_claims(user_id, period_key);

create trigger personal_quest_definitions_set_updated_at
before update on public.personal_quest_definitions
for each row execute function private.set_updated_at();

insert into public.personal_quest_definitions
  (code, title, description, type, condition_type, target_count, manager_only, reward_points, reward_exp)
values
  ('daily_login_1', 'Daily check-in', 'Check in once today.', 'DAILY', 'ATTENDANCE', 1, false, 50, 10),
  ('daily_education_1', 'Daily safety education', 'Complete one verified education course today.', 'DAILY', 'EDUCATION_COMPLETION', 1, false, 100, 30),
  ('daily_checklist_1', 'Daily safety checklist', 'Submit one safety checklist today.', 'DAILY', 'CHECKLIST_SUBMISSION', 1, false, 100, 20),
  ('daily_hazard_1', 'Hazard discovery', 'Report one hazard cycle today.', 'DAILY', 'HAZARD_REPORT', 1, false, 100, 30),
  ('daily_review_1', 'Checklist reviewer', 'Review two submitted checklists today.', 'DAILY', 'CHECKLIST_REVIEW', 2, true, 200, 40),
  ('weekly_checklist_1', 'Weekly checklist master', 'Submit ten safety checklists this week.', 'WEEKLY', 'CHECKLIST_SUBMISSION', 10, false, 1000, 200),
  ('weekly_hazard_1', 'Weekly hazard action', 'Report five hazard cycles this week.', 'WEEKLY', 'HAZARD_REPORT', 5, false, 500, 100),
  ('weekly_review_1', 'Weekly reviewer', 'Review ten checklists this week.', 'WEEKLY', 'CHECKLIST_REVIEW', 10, true, 1200, 250),
  ('monthly_checklist_master', 'Monthly checklist master', 'Submit fifty safety checklists this month.', 'MONTHLY', 'CHECKLIST_SUBMISSION', 50, false, 5000, 1000),
  ('monthly_mentor', 'Monthly mentor', 'Review one hundred checklists this month.', 'MONTHLY', 'CHECKLIST_REVIEW', 100, true, 7000, 1200);

alter table public.personal_quest_definitions enable row level security;
alter table public.personal_quest_claims enable row level security;
create policy "personal quest definitions: signed-in users read active"
  on public.personal_quest_definitions for select to authenticated
  using (active or (select private.is_manager()));
create policy "personal quest claims: owner or manager reads"
  on public.personal_quest_claims for select to authenticated
  using ((select auth.uid()) = user_id or (select private.is_manager()));
grant select on public.personal_quest_definitions, public.personal_quest_claims to authenticated;
grant all on public.personal_quest_definitions, public.personal_quest_claims to service_role;

create or replace function public.get_my_personal_quests(p_period text default 'all')
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_today date := timezone('Asia/Seoul', now())::date;
  v_quest public.personal_quest_definitions;
  v_start date;
  v_end date;
  v_period_key text;
  v_current integer;
  v_rows jsonb := '[]'::jsonb;
begin
  if v_user_id is null then raise exception 'Authentication required' using errcode = '28000'; end if;
  if p_period not in ('all', 'daily', 'weekly', 'monthly') then raise exception 'Invalid period' using errcode = '22023'; end if;
  for v_quest in
    select * from public.personal_quest_definitions
     where active
       and (not manager_only or (select private.is_manager()))
       and (p_period = 'all' or lower(type) = p_period)
     order by case type when 'DAILY' then 1 when 'WEEKLY' then 2 else 3 end, code
  loop
    if v_quest.type = 'DAILY' then
      v_start := v_today; v_end := v_today + 1; v_period_key := to_char(v_today, 'YYYYMMDD');
    elsif v_quest.type = 'WEEKLY' then
      v_start := date_trunc('week', v_today)::date; v_end := v_start + 7; v_period_key := to_char(v_start, 'IYYY-"W"IW');
    else
      v_start := date_trunc('month', v_today)::date; v_end := (v_start + interval '1 month')::date; v_period_key := to_char(v_start, 'YYYY-MM');
    end if;
    if v_quest.condition_type = 'ATTENDANCE' then
      select count(*) into v_current from public.attendance_records where user_id = v_user_id and check_in_date >= v_start and check_in_date < v_end;
    elsif v_quest.condition_type = 'EDUCATION_COMPLETION' then
      select count(*) into v_current from public.education_completions where user_id = v_user_id and completed_at >= v_start and completed_at < v_end;
    elsif v_quest.condition_type = 'CHECKLIST_SUBMISSION' then
      select count(*) into v_current from public.checklists where user_id = v_user_id and submitted_at >= v_start and submitted_at < v_end;
    elsif v_quest.condition_type = 'CHECKLIST_REVIEW' then
      select count(*) into v_current from public.checklist_review_logs where reviewer_id = v_user_id and reviewed_at >= v_start and reviewed_at < v_end;
    else
      select count(*) into v_current from public.hazard_cycles where reporter_id = v_user_id and reported_at >= v_start and reported_at < v_end;
    end if;
    v_current := least(v_current, v_quest.target_count);
    v_rows := v_rows || jsonb_build_array(jsonb_build_object(
      'id', v_quest.id, 'code', v_quest.code, 'title', v_quest.title, 'description', v_quest.description,
      'type', v_quest.type, 'conditionType', v_quest.condition_type, 'periodKey', v_period_key,
      'requirement', jsonb_build_object('target', v_quest.target_count),
      'progress', jsonb_build_object('current', v_current, 'completed', v_current >= v_quest.target_count),
      'reward', jsonb_build_object('points', v_quest.reward_points, 'exp', v_quest.reward_exp),
      'rewardClaimed', exists (select 1 from public.personal_quest_claims c where c.user_id = v_user_id and c.quest_id = v_quest.id and c.period_key = v_period_key)
    ));
  end loop;
  return v_rows;
end;
$$;

create or replace function public.claim_personal_quest_reward(p_quest_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_quest public.personal_quest_definitions;
  v_row jsonb;
  v_period_key text;
  v_balance integer;
  v_claim_id uuid;
begin
  if v_user_id is null then raise exception 'Authentication required' using errcode = '28000'; end if;
  select * into v_quest from public.personal_quest_definitions where id = p_quest_id and active;
  if not found then raise exception 'Quest was not found' using errcode = 'P0002'; end if;
  if v_quest.manager_only and not (select private.is_manager()) then raise exception 'Manager role is required' using errcode = '42501'; end if;
  select value into v_row from jsonb_array_elements(public.get_my_personal_quests('all')) where (value->>'id')::uuid = p_quest_id;
  if v_row is null or not coalesce((v_row->'progress'->>'completed')::boolean, false) then raise exception 'Quest is not complete' using errcode = 'P0001'; end if;
  v_period_key := v_row->>'periodKey';
  insert into public.personal_quest_claims(user_id, quest_id, period_key)
  values(v_user_id, p_quest_id, v_period_key)
  on conflict(user_id, quest_id, period_key) do nothing
  returning id into v_claim_id;
  if v_claim_id is null then raise exception 'Reward has already been issued' using errcode = 'P0001'; end if;
  update public.user_points set balance = balance + v_quest.reward_points, total_earned = total_earned + v_quest.reward_points, updated_at = now()
   where user_id = v_user_id returning balance into v_balance;
  insert into public.point_transactions(user_id, amount, transaction_type, reason, description, balance_after)
  values(v_user_id, v_quest.reward_points, 'EARN', 'PERSONAL_QUEST_REWARD', v_quest.code, v_balance);
  update public.user_game_profiles set exp = exp + v_quest.reward_exp, total_quests_completed = total_quests_completed + 1, updated_at = now()
   where user_id = v_user_id;
  return jsonb_build_object('questId', p_quest_id, 'periodKey', v_period_key, 'reward', jsonb_build_object('points', v_quest.reward_points, 'exp', v_quest.reward_exp), 'balance', v_balance);
end;
$$;

revoke all on function public.get_my_personal_quests(text), public.claim_personal_quest_reward(uuid) from public, anon;
grant execute on function public.get_my_personal_quests(text), public.claim_personal_quest_reward(uuid) to authenticated;
