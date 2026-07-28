create or replace function public.leave_team(p_team_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_is_leader boolean;
  v_status text;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  select is_leader, status
    into v_is_leader, v_status
    from public.team_memberships
   where team_id = p_team_id and user_id = v_user_id;

  if not found or v_status <> 'APPROVED' then
    raise exception 'Active team membership was not found' using errcode = 'P0002';
  end if;
  if v_is_leader then
    raise exception 'Transfer leadership before leaving the team' using errcode = 'P0001';
  end if;

  delete from public.team_memberships
   where team_id = p_team_id and user_id = v_user_id and not is_leader;
end;
$$;

create or replace function public.kick_team_member(p_team_id uuid, p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_requester_id uuid := auth.uid();
  v_target_is_leader boolean;
  v_target_status text;
begin
  if v_requester_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;
  if p_user_id = v_requester_id then
    raise exception 'You cannot remove yourself from the team' using errcode = 'P0001';
  end if;
  if not (select private.is_manager()) and not exists (
    select 1
      from public.team_memberships
     where team_id = p_team_id
       and user_id = v_requester_id
       and is_leader
       and status = 'APPROVED'
  ) then
    raise exception 'Team leader required' using errcode = '42501';
  end if;

  select is_leader, status
    into v_target_is_leader, v_target_status
    from public.team_memberships
   where team_id = p_team_id and user_id = p_user_id;

  if not found or v_target_status <> 'APPROVED' then
    raise exception 'Active team membership was not found' using errcode = 'P0002';
  end if;
  if v_target_is_leader then
    raise exception 'Team leader cannot be removed' using errcode = 'P0001';
  end if;

  delete from public.team_memberships
   where team_id = p_team_id and user_id = p_user_id and not is_leader;
end;
$$;

revoke all on function public.leave_team(uuid), public.kick_team_member(uuid, uuid) from public, anon;
grant execute on function public.leave_team(uuid), public.kick_team_member(uuid, uuid) to authenticated;
