-- Client input is limited to a cosmetic/quest-routing game role. Progress and
-- points intentionally have no client-callable mutation endpoint.
create or replace function public.set_my_game_role(p_game_role text)
returns public.user_game_profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_profile public.user_game_profiles;
begin
  if v_user_id is null then
    raise exception 'Authentication is required' using errcode = '28000';
  end if;

  if p_game_role is not null
     and p_game_role not in ('technician', 'supervisor', 'safety_manager') then
    raise exception 'Unsupported game role' using errcode = '22023';
  end if;

  update public.user_game_profiles
     set game_role = p_game_role,
         updated_at = now()
   where user_id = v_user_id
   returning * into v_profile;

  if not found then
    raise exception 'Game profile was not found' using errcode = 'P0002';
  end if;

  return v_profile;
end;
$$;

revoke all on function public.set_my_game_role(text) from public, anon;
grant execute on function public.set_my_game_role(text) to authenticated;
