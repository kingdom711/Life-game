create extension if not exists pg_cron;

create or replace function public.close_weekly_quests()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_week_start date := date_trunc('week', timezone('Asia/Seoul', now()))::date;
  v_period_key text := to_char(v_week_start, 'IYYY-"W"IW');
  v_quest public.quest_definitions;
  v_team record;
  v_member record;
  v_total integer;
  v_completed integer;
  v_reward_id uuid;
  v_balance integer;
  v_gold_balance integer;
  v_closed integer := 0;
begin
  for v_team in
    select distinct tm.team_id
      from public.team_memberships tm
     where tm.status = 'APPROVED'
  loop
    select count(*) into v_total
      from public.team_memberships tm
     where tm.team_id = v_team.team_id and tm.status = 'APPROVED';

    for v_quest in
      select * from public.quest_definitions
       where active and scope = 'TEAM' and type = 'WEEKLY'
    loop
      if v_quest.condition_type = 'EDUCATION_COMPLETED' then
        select count(*) into v_completed
          from public.team_memberships tm
         where tm.team_id = v_team.team_id
           and tm.status = 'APPROVED'
           and exists (
             select 1 from public.education_completions e
              where e.user_id = tm.user_id
                and (e.completed_at at time zone 'Asia/Seoul')::date
                    between v_week_start and v_week_start + 6
           );
      elsif v_quest.condition_type = 'ZERO_WORK_STOP' then
        select count(*) into v_completed
          from public.team_memberships tm
         where tm.team_id = v_team.team_id
           and tm.status = 'APPROVED'
           and not exists (
             select 1 from public.work_stop_reports w
              where w.reporter_id = tm.user_id
                and (w.created_at at time zone 'Asia/Seoul')::date
                    between v_week_start and v_week_start + 6
           );
      else
        continue;
      end if;

      if v_total = 0 or v_completed <> v_total then
        continue;
      end if;

      insert into public.team_quest_rewards(team_id, quest_id, period_key, rewarded_by)
      values (v_team.team_id, v_quest.id, v_period_key, (select owner_id from public.teams where id = v_team.team_id))
      on conflict (team_id, quest_id, period_key) do nothing
      returning id into v_reward_id;
      if v_reward_id is null then
        continue;
      end if;

      for v_member in
        select user_id from public.team_memberships
         where team_id = v_team.team_id and status = 'APPROVED'
      loop
        update public.user_points
           set balance = balance + v_quest.reward_points,
               total_earned = total_earned + v_quest.reward_points,
               updated_at = now()
         where user_id = v_member.user_id
        returning balance into v_balance;
        insert into public.point_transactions(user_id, amount, transaction_type, reason, description, balance_after)
        values (v_member.user_id, v_quest.reward_points, 'EARN', 'TEAM_QUEST_WEEKLY_CLOSE', v_quest.code, v_balance);

        update public.user_game_profiles
           set exp = exp + v_quest.reward_exp,
               total_quests_completed = total_quests_completed + 1,
               updated_at = now()
         where user_id = v_member.user_id;

        if v_quest.reward_gold > 0 then
          update public.user_gold
             set balance = balance + v_quest.reward_gold,
                 total_earned = total_earned + v_quest.reward_gold,
                 updated_at = now()
           where user_id = v_member.user_id
          returning balance into v_gold_balance;
          insert into public.gold_transactions(user_id, amount, transaction_type, reason, description, balance_after)
          values (v_member.user_id, v_quest.reward_gold, 'EARN', 'TEAM_QUEST_WEEKLY_CLOSE', v_quest.code, v_gold_balance);
        end if;
      end loop;
      v_closed := v_closed + 1;
    end loop;
  end loop;

  return jsonb_build_object('periodKey', v_period_key, 'closedQuestCount', v_closed);
end;
$$;

revoke all on function public.close_weekly_quests() from public, anon, authenticated;
grant execute on function public.close_weekly_quests() to service_role;

select cron.unschedule(jobid)
  from cron.job
 where jobname = 'close-weekly-quests';

select cron.schedule(
  'close-weekly-quests',
  '55 14 * * 0',
  $$select public.close_weekly_quests();$$
);
