create or replace function public.get_user_rankings(
  p_type text default 'points',
  p_limit integer default 10,
  p_period text default 'all',
  p_role text default null
)
returns table(
  rank bigint,
  user_id uuid,
  name text,
  username text,
  role text,
  points integer,
  level integer,
  streak integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_role public.app_role;
  v_start_at timestamptz;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;
  if p_type not in ('points', 'level', 'streak') then
    raise exception 'Unsupported ranking type' using errcode = '22023';
  end if;
  if p_period not in ('all', 'weekly', 'monthly', 'yearly') then
    raise exception 'Unsupported ranking period' using errcode = '22023';
  end if;
  if p_limit is null or p_limit not between 1 and 100 then
    raise exception 'Ranking limit must be between 1 and 100' using errcode = '22023';
  end if;
  if nullif(trim(p_role), '') is not null then
    begin
      v_role := case lower(trim(p_role))
        when 'technician' then 'USER'::public.app_role
        else upper(trim(p_role))::public.app_role
      end;
    exception when invalid_text_representation then
      raise exception 'Unsupported role filter' using errcode = '22023';
    end;
  end if;

  v_start_at := case p_period
    when 'weekly' then date_trunc('week', now() at time zone 'Asia/Seoul') at time zone 'Asia/Seoul'
    when 'monthly' then date_trunc('month', now() at time zone 'Asia/Seoul') at time zone 'Asia/Seoul'
    when 'yearly' then date_trunc('year', now() at time zone 'Asia/Seoul') at time zone 'Asia/Seoul'
    else null
  end;

  return query
  with activity_points as (
    select t.user_id,
           coalesce(sum(case when t.transaction_type = 'SPEND' then -abs(t.amount) else abs(t.amount) end), 0)::integer as period_points
      from public.point_transactions t
     where v_start_at is not null and t.created_at >= v_start_at
     group by t.user_id
  ), ranked as (
    select
      p.id as ranked_user_id,
      p.name as ranked_name,
      p.username as ranked_username,
      p.role::text as ranked_role,
      case when p_period = 'all' then coalesce(up.balance, 0) else coalesce(ap.period_points, 0) end as ranked_points,
      coalesce(gp.level, 1) as ranked_level,
      coalesce(us.current_streak, 0) as ranked_streak,
      rank() over (
        order by
          case p_type
            when 'points' then case when p_period = 'all' then coalesce(up.balance, 0) else coalesce(ap.period_points, 0) end
            when 'level' then coalesce(gp.level, 1)
            else coalesce(us.current_streak, 0)
          end desc,
          p.id
      ) as ranked_rank
    from public.profiles p
    left join public.user_points up on up.user_id = p.id
    left join public.user_game_profiles gp on gp.user_id = p.id
    left join public.user_streaks us on us.user_id = p.id
    left join activity_points ap on ap.user_id = p.id
    where p.status = 'ACTIVE' and (v_role is null or p.role = v_role)
  )
  select ranked_rank, ranked_user_id, ranked_name, ranked_username, ranked_role,
         ranked_points, ranked_level, ranked_streak
    from ranked
   order by ranked_rank, ranked_user_id
   limit p_limit;
end;
$$;

create or replace function public.get_my_user_rank(
  p_type text default 'points',
  p_period text default 'all'
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_start_at timestamptz;
  v_row record;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;
  if p_type not in ('points', 'level', 'streak') then
    raise exception 'Unsupported ranking type' using errcode = '22023';
  end if;
  if p_period not in ('all', 'weekly', 'monthly', 'yearly') then
    raise exception 'Unsupported ranking period' using errcode = '22023';
  end if;
  v_start_at := case p_period
    when 'weekly' then date_trunc('week', now() at time zone 'Asia/Seoul') at time zone 'Asia/Seoul'
    when 'monthly' then date_trunc('month', now() at time zone 'Asia/Seoul') at time zone 'Asia/Seoul'
    when 'yearly' then date_trunc('year', now() at time zone 'Asia/Seoul') at time zone 'Asia/Seoul'
    else null
  end;
  with activity_points as (
    select t.user_id,
           coalesce(sum(case when t.transaction_type = 'SPEND' then -abs(t.amount) else abs(t.amount) end), 0)::integer as period_points
      from public.point_transactions t
     where v_start_at is not null and t.created_at >= v_start_at
     group by t.user_id
  ), ranked as (
    select p.id, p.name, p.role::text as role,
      case when p_period = 'all' then coalesce(up.balance, 0) else coalesce(ap.period_points, 0) end as points,
      coalesce(gp.level, 1) as level,
      coalesce(us.current_streak, 0) as streak,
      rank() over (order by case p_type
        when 'points' then case when p_period = 'all' then coalesce(up.balance, 0) else coalesce(ap.period_points, 0) end
        when 'level' then coalesce(gp.level, 1)
        else coalesce(us.current_streak, 0)
      end desc, p.id) as user_rank
    from public.profiles p
    left join public.user_points up on up.user_id = p.id
    left join public.user_game_profiles gp on gp.user_id = p.id
    left join public.user_streaks us on us.user_id = p.id
    left join activity_points ap on ap.user_id = p.id
    where p.status = 'ACTIVE'
  )
  select * into v_row from ranked where id = v_user_id;
  if not found then
    return jsonb_build_object('rank', null, 'type', p_type, 'period', p_period);
  end if;
  return jsonb_build_object(
    'rank', v_row.user_rank, 'userId', v_user_id, 'name', v_row.name,
    'role', v_row.role, 'points', v_row.points, 'level', v_row.level,
    'streak', v_row.streak, 'type', p_type, 'period', p_period
  );
end;
$$;

create or replace function public.get_team_rankings(p_limit integer default 10)
returns table(
  rank bigint,
  team_id uuid,
  team_name text,
  member_count bigint,
  total_points bigint,
  avg_points bigint,
  top_member text
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;
  if p_limit is null or p_limit not between 1 and 100 then
    raise exception 'Ranking limit must be between 1 and 100' using errcode = '22023';
  end if;

  return query
  with team_scores as (
    select t.id, t.name,
           count(m.user_id)::bigint as members,
           coalesce(sum(up.balance), 0)::bigint as points,
           coalesce(avg(up.balance), 0)::bigint as average_points,
           (array_agg(p.name order by coalesce(up.balance, 0) desc, p.id))[1] as highest_member
      from public.teams t
      join public.team_memberships m on m.team_id = t.id and m.status = 'APPROVED'
      join public.profiles p on p.id = m.user_id and p.status = 'ACTIVE'
      left join public.user_points up on up.user_id = m.user_id
     group by t.id, t.name
  )
  select rank() over (order by points desc, id), id, name, members, points, average_points, highest_member
    from team_scores
   order by points desc, id
   limit p_limit;
end;
$$;

revoke all on function public.get_user_rankings(text, integer, text, text), public.get_my_user_rank(text, text), public.get_team_rankings(integer) from public, anon;
grant execute on function public.get_user_rankings(text, integer, text, text), public.get_my_user_rank(text, text), public.get_team_rankings(integer) to authenticated;
