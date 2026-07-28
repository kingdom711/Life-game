-- Remote migration version: 20260727063441.
create table if not exists public.shop_items (
  id text primary key,
  display_name text not null,
  category text not null,
  rarity text not null,
  price integer not null check (price > 0),
  base_stats jsonb not null default '{}'::jsonb,
  set_id text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_inventory_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id text not null references public.shop_items(id),
  calibration_level integer not null default 0 check (calibration_level >= 0),
  is_equipped boolean not null default false,
  purchased_at timestamptz not null default now(),
  unique (user_id, item_id)
);

create table if not exists public.shop_purchase_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id text not null references public.shop_items(id),
  points_spent integer not null check (points_spent > 0),
  created_at timestamptz not null default now()
);

create index if not exists user_inventory_items_user_id_idx on public.user_inventory_items(user_id);
create index if not exists shop_purchase_transactions_user_id_idx on public.shop_purchase_transactions(user_id, created_at desc);

alter table public.shop_items enable row level security;
alter table public.user_inventory_items enable row level security;
alter table public.shop_purchase_transactions enable row level security;

drop policy if exists "authenticated users can read active shop items" on public.shop_items;
create policy "authenticated users can read active shop items"
  on public.shop_items for select to authenticated using (is_active);

drop policy if exists "users can read own inventory" on public.user_inventory_items;
create policy "users can read own inventory"
  on public.user_inventory_items for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "users can read own shop purchases" on public.shop_purchase_transactions;
create policy "users can read own shop purchases"
  on public.shop_purchase_transactions for select to authenticated
  using ((select auth.uid()) = user_id);

insert into public.shop_items (id, display_name, category, rarity, price, base_stats, set_id) values
  ('helmet_common_1', 'helmet_common_1', 'helmet', 'common', 150, '{"pointBoost":5,"xpAccelerator":0,"streakSaver":0}', 'set_standard_worker'),
  ('helmet_rare_1', 'helmet_rare_1', 'helmet', 'rare', 500, '{"pointBoost":8,"xpAccelerator":2,"streakSaver":0}', 'set_ventilation_pro'),
  ('helmet_epic_1', 'helmet_epic_1', 'helmet', 'epic', 900, '{"pointBoost":12,"xpAccelerator":5,"streakSaver":3}', 'set_winter_guardian'),
  ('helmet_legendary_1', 'helmet_legendary_1', 'helmet', 'legendary', 2000, '{"pointBoost":20,"xpAccelerator":10,"streakSaver":10}', 'set_neon_guardian'),
  ('vest_common_1', 'vest_common_1', 'vest', 'common', 100, '{"pointBoost":5,"xpAccelerator":0,"streakSaver":0}', 'set_standard_worker'),
  ('vest_rare_1', 'vest_rare_1', 'vest', 'rare', 400, '{"pointBoost":8,"xpAccelerator":2,"streakSaver":0}', 'set_ventilation_pro'),
  ('vest_epic_1', 'vest_epic_1', 'vest', 'epic', 800, '{"pointBoost":10,"xpAccelerator":4,"streakSaver":2}', 'set_neon_guardian'),
  ('gloves_common_1', 'gloves_common_1', 'gloves', 'common', 120, '{"pointBoost":3,"xpAccelerator":0,"streakSaver":0}', 'set_standard_worker'),
  ('gloves_rare_1', 'gloves_rare_1', 'gloves', 'rare', 450, '{"pointBoost":6,"xpAccelerator":2,"streakSaver":0}', 'set_ventilation_pro'),
  ('gloves_epic_1', 'gloves_epic_1', 'gloves', 'epic', 1000, '{"pointBoost":12,"xpAccelerator":5,"streakSaver":3}', 'set_winter_guardian'),
  ('shoes_common_1', 'shoes_common_1', 'shoes', 'common', 200, '{"pointBoost":5,"xpAccelerator":0,"streakSaver":0}', 'set_standard_worker'),
  ('shoes_rare_1', 'shoes_rare_1', 'shoes', 'rare', 600, '{"pointBoost":8,"xpAccelerator":2,"streakSaver":0}', 'set_ventilation_pro'),
  ('shoes_epic_1', 'shoes_epic_1', 'shoes', 'epic', 1100, '{"pointBoost":12,"xpAccelerator":5,"streakSaver":3}', 'set_winter_guardian'),
  ('shoes_legendary_1', 'shoes_legendary_1', 'shoes', 'legendary', 2500, '{"pointBoost":25,"xpAccelerator":12,"streakSaver":8}', 'set_neon_guardian'),
  ('glasses_common_1', 'glasses_common_1', 'glasses', 'common', 150, '{"pointBoost":5,"xpAccelerator":0,"streakSaver":0}', 'set_standard_worker'),
  ('glasses_rare_1', 'glasses_rare_1', 'glasses', 'rare', 500, '{"pointBoost":8,"xpAccelerator":2,"streakSaver":0}', 'set_ventilation_pro'),
  ('glasses_epic_1', 'glasses_epic_1', 'glasses', 'epic', 950, '{"pointBoost":10,"xpAccelerator":4,"streakSaver":2}', 'set_neon_guardian'),
  ('belt_common_1', 'belt_common_1', 'belt', 'common', 300, '{"pointBoost":6,"xpAccelerator":2,"streakSaver":0}', 'set_standard_worker'),
  ('belt_rare_1', 'belt_rare_1', 'belt', 'rare', 700, '{"pointBoost":10,"xpAccelerator":3,"streakSaver":2}', 'set_ventilation_pro'),
  ('belt_legendary_1', 'belt_legendary_1', 'belt', 'legendary', 1800, '{"pointBoost":18,"xpAccelerator":8,"streakSaver":10}', 'set_neon_guardian'),
  ('mask_common_1', 'mask_common_1', 'mask', 'common', 180, '{"pointBoost":5,"xpAccelerator":0,"streakSaver":0}', 'set_standard_worker'),
  ('mask_rare_1', 'mask_rare_1', 'mask', 'rare', 550, '{"pointBoost":8,"xpAccelerator":2,"streakSaver":0}', 'set_ventilation_pro'),
  ('mask_epic_1', 'mask_epic_1', 'mask', 'epic', 1200, '{"pointBoost":12,"xpAccelerator":5,"streakSaver":3}', 'set_winter_guardian')
on conflict (id) do update set
  category = excluded.category, rarity = excluded.rarity, price = excluded.price,
  base_stats = excluded.base_stats, set_id = excluded.set_id, updated_at = now();

create or replace function public.purchase_shop_item(p_item_id text)
returns table (item_id text, points_remaining bigint)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_price integer;
  v_points bigint;
begin
  if v_user_id is null then raise exception 'Authentication required'; end if;

  select price into v_price from public.shop_items where id = p_item_id and is_active;
  if v_price is null then raise exception 'Unknown or inactive item'; end if;
  if exists (select 1 from public.user_inventory_items where user_id = v_user_id and item_id = p_item_id) then
    raise exception 'Item already owned';
  end if;

  select balance into v_points from public.user_points where user_id = v_user_id for update;
  if v_points is null or v_points < v_price then raise exception 'Insufficient points'; end if;

  update public.user_points
    set balance = balance - v_price, total_spent = total_spent + v_price, updated_at = now()
    where user_id = v_user_id;
  insert into public.point_transactions (user_id, amount, transaction_type, reason, description, balance_after)
    values (v_user_id, -v_price, 'SPEND', 'SHOP_PURCHASE', 'shop item: ' || p_item_id, v_points - v_price);
  insert into public.user_inventory_items (user_id, item_id) values (v_user_id, p_item_id);
  insert into public.shop_purchase_transactions (user_id, item_id, points_spent) values (v_user_id, p_item_id, v_price);

  return query select p_item_id, (v_points - v_price);
end;
$$;

revoke all on function public.purchase_shop_item(text) from public, anon;
grant execute on function public.purchase_shop_item(text) to authenticated;
