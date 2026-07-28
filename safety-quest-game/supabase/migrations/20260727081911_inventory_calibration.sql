create table public.inventory_calibration_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  item_id text not null references public.shop_items(id),
  level_before integer not null check (level_before >= 0),
  level_after integer not null check (level_after >= level_before),
  points_spent integer not null check (points_spent > 0),
  success boolean not null,
  success_rate numeric(4,3) not null check (success_rate > 0 and success_rate <= 1),
  created_at timestamptz not null default now()
);
create index inventory_calibration_logs_user_created_idx on public.inventory_calibration_logs(user_id, created_at desc);

alter table public.inventory_calibration_logs enable row level security;
create policy "inventory calibration logs: owner or manager reads" on public.inventory_calibration_logs
  for select to authenticated using ((select auth.uid()) = user_id or (select private.is_manager()));
grant select on public.inventory_calibration_logs to authenticated;
grant all on public.inventory_calibration_logs to service_role;

create or replace function public.calibrate_inventory_item(p_item_id text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_inventory public.user_inventory_items;
  v_rarity text;
  v_max_level integer;
  v_cost_base integer;
  v_rate_base numeric;
  v_rate_decay numeric;
  v_cost integer;
  v_rate numeric;
  v_success boolean;
  v_points integer;
  v_balance integer;
  v_level_after integer;
begin
  if v_user_id is null then raise exception 'Authentication required' using errcode = '28000'; end if;
  select i.* into v_inventory
    from public.user_inventory_items i
    where i.user_id = v_user_id and i.item_id = p_item_id
    for update of i;
  if not found then raise exception 'Owned inventory item was not found' using errcode = 'P0002'; end if;
  select rarity into v_rarity from public.shop_items where id = p_item_id;
  case v_rarity
    when 'common' then v_max_level := 5; v_cost_base := 200; v_rate_base := 0.95; v_rate_decay := 0.05;
    when 'rare' then v_max_level := 7; v_cost_base := 400; v_rate_base := 0.90; v_rate_decay := 0.05;
    when 'epic' then v_max_level := 10; v_cost_base := 600; v_rate_base := 0.85; v_rate_decay := 0.05;
    when 'legendary' then v_max_level := 15; v_cost_base := 1000; v_rate_base := 0.80; v_rate_decay := 0.04;
    else raise exception 'Unsupported item rarity' using errcode = '22023';
  end case;
  if v_inventory.calibration_level >= v_max_level then raise exception 'Maximum calibration level reached' using errcode = 'P0001'; end if;
  v_cost := v_cost_base * (v_inventory.calibration_level + 1);
  v_rate := greatest(0.10, v_rate_base - (v_rate_decay * v_inventory.calibration_level));
  select balance into v_points from public.user_points where user_id = v_user_id for update;
  if coalesce(v_points, 0) < v_cost then raise exception 'Insufficient points' using errcode = 'P0001'; end if;
  v_success := random() < v_rate;
  v_level_after := v_inventory.calibration_level + case when v_success then 1 else 0 end;
  update public.user_points set balance = balance - v_cost, total_spent = total_spent + v_cost, updated_at = now()
    where user_id = v_user_id returning balance into v_balance;
  insert into public.point_transactions(user_id, amount, transaction_type, reason, description, balance_after)
    values(v_user_id, v_cost, 'SPEND', 'INVENTORY_CALIBRATION', p_item_id || ' calibration', v_balance);
  update public.user_inventory_items set calibration_level = v_level_after
    where id = v_inventory.id;
  insert into public.inventory_calibration_logs(user_id, item_id, level_before, level_after, points_spent, success, success_rate)
    values(v_user_id, p_item_id, v_inventory.calibration_level, v_level_after, v_cost, v_success, v_rate);
  return jsonb_build_object('itemId', p_item_id, 'success', v_success,
    'status', case when v_success then 'SUCCESS' else 'FAILURE' end,
    'levelBefore', v_inventory.calibration_level, 'levelAfter', v_level_after,
    'pointsSpent', v_cost, 'pointsBalance', v_balance, 'successRate', v_rate, 'maxLevel', v_max_level);
end;
$$;

revoke all on function public.calibrate_inventory_item(text) from public, anon;
grant execute on function public.calibrate_inventory_item(text) to authenticated;
