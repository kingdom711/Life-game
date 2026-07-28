create function public.attendance_check_in()
returns table (
  check_in_date date,
  points_earned integer,
  current_streak integer,
  longest_streak integer,
  bonus_awarded boolean
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := (select auth.uid());
  today_kst date := (now() at time zone 'Asia/Seoul')::date;
  next_streak integer;
  next_longest integer;
  earned_points integer := 10;
  has_bonus boolean := false;
  next_balance integer;
begin
  if current_user_id is null then
    raise exception 'authentication is required' using errcode = '42501';
  end if;

  if exists (
    select 1 from public.attendance_records
    where user_id = current_user_id and check_in_date = today_kst
  ) then
    raise exception 'already checked in today' using errcode = 'P0001';
  end if;

  insert into public.user_streaks (user_id) values (current_user_id) on conflict do nothing;
  insert into public.user_points (user_id) values (current_user_id) on conflict do nothing;

  select
    case when last_check_in_date = today_kst - 1 then current_streak + 1 else 1 end,
    greatest(longest_streak, case when last_check_in_date = today_kst - 1 then current_streak + 1 else 1 end)
  into next_streak, next_longest
  from public.user_streaks
  where user_id = current_user_id
  for update;

  has_bonus := next_streak % 7 = 0;
  if has_bonus then earned_points := earned_points + 5; end if;

  update public.user_streaks
  set current_streak = next_streak, longest_streak = next_longest, last_check_in_date = today_kst, updated_at = now()
  where user_id = current_user_id;

  update public.user_points
  set balance = balance + earned_points, total_earned = total_earned + earned_points, updated_at = now()
  where user_id = current_user_id
  returning balance into next_balance;

  insert into public.attendance_records (user_id, check_in_date, points_earned, streak_at_time)
  values (current_user_id, today_kst, earned_points, next_streak);
  insert into public.point_transactions (user_id, amount, transaction_type, reason, description, balance_after)
  values (current_user_id, earned_points, 'EARN', '출석 체크인',
    case when has_bonus then format('출석 %s일차 (7일 연속 보너스 포함)', next_streak) else format('출석 %s일차', next_streak) end,
    next_balance);

  return query select today_kst, earned_points, next_streak, next_longest, has_bonus;
exception when unique_violation then
  raise exception 'already checked in today' using errcode = 'P0001';
end;
$$;

revoke all on function public.attendance_check_in() from public, anon;
grant execute on function public.attendance_check_in() to authenticated;
