create table public.quest_definitions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (char_length(code) between 3 and 100),
  title text not null check (char_length(title) between 1 and 200),
  description text not null check (char_length(description) between 1 and 1000),
  type text not null check (type in ('DAILY', 'WEEKLY')),
  scope text not null check (scope in ('TEAM')),
  condition_type text not null check (condition_type in ('DAILY_ALL_COMPLETE', 'HAZARD_REPORTED', 'ZERO_WORK_STOP', 'EDUCATION_COMPLETED')),
  reward_points integer not null default 0 check (reward_points >= 0),
  reward_exp integer not null default 0 check (reward_exp >= 0),
  reward_gold integer not null default 0 check (reward_gold >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.team_quest_rewards (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  quest_id uuid not null references public.quest_definitions(id) on delete cascade,
  period_key text not null check (char_length(period_key) between 8 and 20),
  rewarded_by uuid not null references public.profiles(id),
  rewarded_at timestamptz not null default now(),
  unique(team_id, quest_id, period_key)
);
create index team_quest_rewards_team_period_idx on public.team_quest_rewards(team_id, period_key);

create trigger quest_definitions_set_updated_at
before update on public.quest_definitions
for each row execute function private.set_updated_at();

insert into public.quest_definitions (code, title, description, type, scope, condition_type, reward_points, reward_exp, reward_gold) values
  ('team_perfect_day', 'Perfect Team Day', 'Every approved team member checks in today.', 'DAILY', 'TEAM', 'DAILY_ALL_COMPLETE', 300, 100, 0),
  ('team_hazard_relay', 'Hazard Relay', 'Every approved team member reports at least one hazard today.', 'DAILY', 'TEAM', 'HAZARD_REPORTED', 200, 50, 0),
  ('team_zero_accident', 'Zero-Accident Week', 'No approved team member files a work-stop report this week.', 'WEEKLY', 'TEAM', 'ZERO_WORK_STOP', 1000, 300, 500),
  ('team_education', 'Team Education', 'Every approved team member completes education this week.', 'WEEKLY', 'TEAM', 'EDUCATION_COMPLETED', 500, 200, 0);

alter table public.quest_definitions enable row level security;
alter table public.team_quest_rewards enable row level security;
create policy "team quest definitions: signed-in users read active" on public.quest_definitions
  for select to authenticated using (active or (select private.is_manager()));
create policy "team quest rewards: team member or manager reads" on public.team_quest_rewards
  for select to authenticated using (
    (select private.is_manager()) or exists (
      select 1 from public.team_memberships tm
      where tm.team_id = team_quest_rewards.team_id and tm.user_id = (select auth.uid()) and tm.status = 'APPROVED'
    )
  );
grant select on public.quest_definitions, public.team_quest_rewards to authenticated;
grant all on public.quest_definitions, public.team_quest_rewards to service_role;

create or replace function public.get_my_team_quests(p_period text default 'all')
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_team_id uuid;
  v_today date := timezone('Asia/Seoul', now())::date;
  v_week_start date := date_trunc('week', timezone('Asia/Seoul', now()))::date;
  v_quest public.quest_definitions;
  v_period_key text;
  v_period_start date;
  v_period_end date;
  v_total integer;
  v_completed integer;
  v_members jsonb;
  v_rows jsonb := '[]'::jsonb;
  v_done boolean;
begin
  if v_user_id is null then raise exception 'Authentication required' using errcode = '28000'; end if;
  if p_period not in ('all', 'daily', 'weekly') then raise exception 'Invalid period' using errcode = '22023'; end if;
  select team_id into v_team_id from public.team_memberships
    where user_id = v_user_id and status = 'APPROVED' order by created_at limit 1;
  if v_team_id is null then return '[]'::jsonb; end if;

  for v_quest in
    select * from public.quest_definitions
    where active and (p_period = 'all' or lower(type) = p_period)
    order by case type when 'DAILY' then 1 else 2 end, code
  loop
    if v_quest.type = 'DAILY' then
      v_period_key := to_char(v_today, 'YYYYMMDD'); v_period_start := v_today; v_period_end := v_today;
    else
      v_period_key := to_char(v_week_start, 'IYYY-"W"IW'); v_period_start := v_week_start; v_period_end := v_week_start + 6;
    end if;

    select count(*) into v_total from public.team_memberships
      where team_id = v_team_id and status = 'APPROVED';
    if v_quest.condition_type = 'HAZARD_REPORTED' then
      select count(*) into v_completed from public.team_memberships tm
      where tm.team_id = v_team_id and tm.status = 'APPROVED' and exists (
        select 1 from public.hazard_cycles h where h.reporter_id = tm.user_id
          and (h.reported_at at time zone 'Asia/Seoul')::date between v_period_start and v_period_end
      );
      select coalesce(jsonb_agg(jsonb_build_object('userId', p.id, 'name', p.name, 'completed', exists (
        select 1 from public.hazard_cycles h where h.reporter_id = tm.user_id
          and (h.reported_at at time zone 'Asia/Seoul')::date between v_period_start and v_period_end
      ), 'progress', case when exists (select 1 from public.hazard_cycles h where h.reporter_id = tm.user_id and (h.reported_at at time zone 'Asia/Seoul')::date between v_period_start and v_period_end) then 1 else 0 end, 'me', tm.user_id = v_user_id)), '[]'::jsonb)
      into v_members from public.team_memberships tm join public.profiles p on p.id = tm.user_id where tm.team_id = v_team_id and tm.status = 'APPROVED';
    elsif v_quest.condition_type = 'EDUCATION_COMPLETED' then
      select count(*) into v_completed from public.team_memberships tm
      where tm.team_id = v_team_id and tm.status = 'APPROVED' and exists (
        select 1 from public.education_completions e where e.user_id = tm.user_id
          and (e.completed_at at time zone 'Asia/Seoul')::date between v_period_start and v_period_end
      );
      select coalesce(jsonb_agg(jsonb_build_object('userId', p.id, 'name', p.name, 'completed', exists (
        select 1 from public.education_completions e where e.user_id = tm.user_id and (e.completed_at at time zone 'Asia/Seoul')::date between v_period_start and v_period_end
      ), 'progress', case when exists (select 1 from public.education_completions e where e.user_id = tm.user_id and (e.completed_at at time zone 'Asia/Seoul')::date between v_period_start and v_period_end) then 1 else 0 end, 'me', tm.user_id = v_user_id)), '[]'::jsonb)
      into v_members from public.team_memberships tm join public.profiles p on p.id = tm.user_id where tm.team_id = v_team_id and tm.status = 'APPROVED';
    elsif v_quest.condition_type = 'DAILY_ALL_COMPLETE' then
      select count(*) into v_completed from public.team_memberships tm
      where tm.team_id = v_team_id and tm.status = 'APPROVED' and exists (
        select 1 from public.attendance_records a where a.user_id = tm.user_id and a.check_in_date = v_period_start
      );
      select coalesce(jsonb_agg(jsonb_build_object('userId', p.id, 'name', p.name, 'completed', exists (
        select 1 from public.attendance_records a where a.user_id = tm.user_id and a.check_in_date = v_period_start
      ), 'progress', case when exists (select 1 from public.attendance_records a where a.user_id = tm.user_id and a.check_in_date = v_period_start) then 1 else 0 end, 'me', tm.user_id = v_user_id)), '[]'::jsonb)
      into v_members from public.team_memberships tm join public.profiles p on p.id = tm.user_id where tm.team_id = v_team_id and tm.status = 'APPROVED';
    else
      select count(*) into v_completed from public.team_memberships tm
      where tm.team_id = v_team_id and tm.status = 'APPROVED' and not exists (
        select 1 from public.work_stop_reports w where w.reporter_id = tm.user_id
          and (w.created_at at time zone 'Asia/Seoul')::date between v_period_start and v_period_end
      );
      select coalesce(jsonb_agg(jsonb_build_object('userId', p.id, 'name', p.name, 'completed', not exists (
        select 1 from public.work_stop_reports w where w.reporter_id = tm.user_id and (w.created_at at time zone 'Asia/Seoul')::date between v_period_start and v_period_end
      ), 'progress', case when not exists (select 1 from public.work_stop_reports w where w.reporter_id = tm.user_id and (w.created_at at time zone 'Asia/Seoul')::date between v_period_start and v_period_end) then 1 else 0 end, 'me', tm.user_id = v_user_id)), '[]'::jsonb)
      into v_members from public.team_memberships tm join public.profiles p on p.id = tm.user_id where tm.team_id = v_team_id and tm.status = 'APPROVED';
    end if;
    v_done := v_total > 0 and v_completed = v_total;
    v_rows := v_rows || jsonb_build_array(jsonb_build_object(
      'id', v_quest.id, 'code', v_quest.code, 'title', v_quest.title, 'description', v_quest.description,
      'type', v_quest.type, 'conditionType', v_quest.condition_type, 'periodKey', v_period_key,
      'completed', v_done, 'completedMemberCount', v_completed, 'totalMemberCount', v_total, 'members', v_members,
      'reward', jsonb_build_object('points', v_quest.reward_points, 'exp', v_quest.reward_exp, 'gold', v_quest.reward_gold),
      'rewardClaimed', exists(select 1 from public.team_quest_rewards r where r.team_id = v_team_id and r.quest_id = v_quest.id and r.period_key = v_period_key)
    ));
  end loop;
  return v_rows;
end;
$$;

create or replace function public.get_my_team_quest_summary()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare v_quests jsonb; v_total integer; v_completed integer;
begin
  v_quests := public.get_my_team_quests('weekly');
  select count(*), count(*) filter (where (value->>'completed')::boolean) into v_total, v_completed
    from jsonb_array_elements(v_quests);
  return jsonb_build_object('weeklyProgress', case when v_total = 0 then 0 else round(100.0 * v_completed / v_total) end,
    'completedQuests', v_completed, 'totalQuests', v_total);
end;
$$;

create or replace function public.claim_team_quest_reward(p_quest_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid(); v_team_id uuid; v_quest public.quest_definitions; v_quest_row jsonb;
  v_period_key text; v_member record; v_balance integer; v_gold_balance integer; v_reward_id uuid; v_awarded integer := 0;
begin
  if v_user_id is null then raise exception 'Authentication required' using errcode = '28000'; end if;
  select team_id into v_team_id from public.team_memberships where user_id = v_user_id and status = 'APPROVED' order by created_at limit 1;
  if v_team_id is null then raise exception 'An approved team is required' using errcode = '42501'; end if;
  select * into v_quest from public.quest_definitions where id = p_quest_id and active;
  if not found then raise exception 'Quest was not found' using errcode = 'P0002'; end if;
  select value into v_quest_row from jsonb_array_elements(public.get_my_team_quests('all')) where (value->>'id')::uuid = p_quest_id;
  if v_quest_row is null or not coalesce((v_quest_row->>'completed')::boolean, false) then raise exception 'Quest is not complete' using errcode = 'P0001'; end if;
  v_period_key := v_quest_row->>'periodKey';
  insert into public.team_quest_rewards(team_id, quest_id, period_key, rewarded_by)
    values(v_team_id, p_quest_id, v_period_key, v_user_id) on conflict(team_id, quest_id, period_key) do nothing returning id into v_reward_id;
  if v_reward_id is null then raise exception 'Reward has already been issued' using errcode = 'P0001'; end if;
  for v_member in select user_id from public.team_memberships where team_id = v_team_id and status = 'APPROVED' loop
    update public.user_points set balance = balance + v_quest.reward_points, total_earned = total_earned + v_quest.reward_points, updated_at = now()
      where user_id = v_member.user_id returning balance into v_balance;
    insert into public.point_transactions(user_id, amount, transaction_type, reason, description, balance_after)
      values(v_member.user_id, v_quest.reward_points, 'EARN', 'TEAM_QUEST_REWARD', v_quest.code, v_balance);
    update public.user_game_profiles set exp = exp + v_quest.reward_exp, total_quests_completed = total_quests_completed + 1, updated_at = now() where user_id = v_member.user_id;
    if v_quest.reward_gold > 0 then
      update public.user_gold set balance = balance + v_quest.reward_gold, total_earned = total_earned + v_quest.reward_gold, updated_at = now()
        where user_id = v_member.user_id returning balance into v_gold_balance;
      insert into public.gold_transactions(user_id, amount, transaction_type, reason, description, balance_after)
        values(v_member.user_id, v_quest.reward_gold, 'EARN', 'TEAM_QUEST_REWARD', v_quest.code, v_gold_balance);
    end if;
    v_awarded := v_awarded + 1;
  end loop;
  return jsonb_build_object('rewardedMembers', v_awarded, 'reward', jsonb_build_object('points', v_quest.reward_points, 'exp', v_quest.reward_exp, 'gold', v_quest.reward_gold), 'periodKey', v_period_key);
end;
$$;

revoke all on function public.get_my_team_quests(text), public.get_my_team_quest_summary(), public.claim_team_quest_reward(uuid) from public, anon;
grant execute on function public.get_my_team_quests(text), public.get_my_team_quest_summary(), public.claim_team_quest_reward(uuid) to authenticated;
