create table public.reward_items (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  description text check (char_length(description) <= 500),
  gold_price integer not null check (gold_price > 0),
  cash_value integer not null default 0 check (cash_value >= 0),
  image_url text,
  reward_type text not null default 'OTHER' check (reward_type in ('COFFEE_COUPON', 'GIFT_CARD', 'VOUCHER', 'OTHER')),
  total_quantity integer not null check (total_quantity >= 0),
  remaining_quantity integer not null check (remaining_quantity >= 0 and remaining_quantity <= total_quantity),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.reward_redemptions (
  id uuid primary key default gen_random_uuid(),
  reward_id uuid not null references public.reward_items(id),
  user_id uuid not null references public.profiles(id),
  gold_paid integer not null check (gold_paid > 0),
  status text not null default 'PENDING' check (status in ('PENDING', 'DELIVERED', 'CANCELLED')),
  coupon_code text check (char_length(coupon_code) <= 100),
  reject_reason text check (char_length(reject_reason) <= 1000),
  processed_by uuid references public.profiles(id),
  processed_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now()
);
create index reward_redemptions_user_created_idx on public.reward_redemptions(user_id, created_at desc);
create index reward_redemptions_status_created_idx on public.reward_redemptions(status, created_at);

create trigger reward_items_set_updated_at
before update on public.reward_items
for each row execute function private.set_updated_at();

alter table public.reward_items enable row level security;
alter table public.reward_redemptions enable row level security;
create policy "reward items: active or manager reads" on public.reward_items
  for select to authenticated using (is_active or (select private.is_manager()));
create policy "reward redemptions: owner or manager reads" on public.reward_redemptions
  for select to authenticated using (user_id = (select auth.uid()) or (select private.is_manager()));
grant select on public.reward_items, public.reward_redemptions to authenticated;
grant all on public.reward_items, public.reward_redemptions to service_role;

create or replace function public.redeem_reward(p_reward_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_reward public.reward_items;
  v_gold integer;
  v_redemption public.reward_redemptions;
begin
  if v_user_id is null then raise exception 'Authentication required' using errcode = '28000'; end if;
  select * into v_reward from public.reward_items where id = p_reward_id for update;
  if not found or not v_reward.is_active then raise exception 'Reward was not found or is inactive' using errcode = 'P0002'; end if;
  if v_reward.remaining_quantity < 1 then raise exception 'Reward is out of stock' using errcode = 'P0001'; end if;
  select balance into v_gold from public.user_gold where user_id = v_user_id for update;
  if coalesce(v_gold, 0) < v_reward.gold_price then raise exception 'Insufficient gold' using errcode = 'P0001'; end if;

  update public.reward_items set remaining_quantity = remaining_quantity - 1 where id = v_reward.id;
  update public.user_gold set balance = balance - v_reward.gold_price, total_spent = total_spent + v_reward.gold_price, updated_at = now()
    where user_id = v_user_id;
  insert into public.gold_transactions(user_id, amount, transaction_type, reason, description, balance_after)
    values (v_user_id, v_reward.gold_price, 'SPEND', 'REWARD_REDEMPTION', v_reward.name, v_gold - v_reward.gold_price);
  insert into public.reward_redemptions(reward_id, user_id, gold_paid)
    values (v_reward.id, v_user_id, v_reward.gold_price) returning * into v_redemption;
  return jsonb_build_object('id', v_redemption.id, 'rewardId', v_reward.id, 'rewardName', v_reward.name,
    'goldPaid', v_redemption.gold_paid, 'status', v_redemption.status, 'createdAt', v_redemption.created_at);
end;
$$;

create or replace function public.approve_reward_redemption(p_redemption_id uuid, p_coupon_code text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_redemption public.reward_redemptions;
begin
  if not (select private.is_admin()) then raise exception 'Administrator role is required' using errcode = '42501'; end if;
  if char_length(trim(coalesce(p_coupon_code, ''))) not between 1 and 100 then raise exception 'Coupon code is required and must be 100 characters or less' using errcode = '22023'; end if;
  select * into v_redemption from public.reward_redemptions where id = p_redemption_id for update;
  if not found then raise exception 'Reward redemption was not found' using errcode = 'P0002'; end if;
  if v_redemption.status <> 'PENDING' then raise exception 'Reward redemption has already been processed' using errcode = 'P0001'; end if;
  update public.reward_redemptions
     set status = 'DELIVERED', coupon_code = trim(p_coupon_code), processed_by = auth.uid(), processed_at = now(), delivered_at = now()
   where id = p_redemption_id returning * into v_redemption;
  return jsonb_build_object('id', v_redemption.id, 'status', v_redemption.status, 'couponCode', v_redemption.coupon_code,
    'processedAt', v_redemption.processed_at, 'deliveredAt', v_redemption.delivered_at);
end;
$$;

create or replace function public.reject_reward_redemption(p_redemption_id uuid, p_reason text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_redemption public.reward_redemptions;
  v_gold integer;
begin
  if not (select private.is_admin()) then raise exception 'Administrator role is required' using errcode = '42501'; end if;
  if char_length(trim(coalesce(p_reason, ''))) not between 1 and 1000 then raise exception 'Rejection reason is required and must be 1,000 characters or less' using errcode = '22023'; end if;
  select * into v_redemption from public.reward_redemptions where id = p_redemption_id for update;
  if not found then raise exception 'Reward redemption was not found' using errcode = 'P0002'; end if;
  if v_redemption.status <> 'PENDING' then raise exception 'Reward redemption has already been processed' using errcode = 'P0001'; end if;
  select balance into v_gold from public.user_gold where user_id = v_redemption.user_id for update;
  update public.user_gold set balance = balance + v_redemption.gold_paid, total_earned = total_earned + v_redemption.gold_paid, updated_at = now()
   where user_id = v_redemption.user_id returning balance into v_gold;
  insert into public.gold_transactions(user_id, amount, transaction_type, reason, description, balance_after)
    values (v_redemption.user_id, v_redemption.gold_paid, 'EARN', 'REWARD_REDEMPTION_REFUND', trim(p_reason), v_gold);
  update public.reward_items set remaining_quantity = remaining_quantity + 1 where id = v_redemption.reward_id;
  update public.reward_redemptions
     set status = 'CANCELLED', reject_reason = trim(p_reason), processed_by = auth.uid(), processed_at = now()
   where id = p_redemption_id returning * into v_redemption;
  return jsonb_build_object('id', v_redemption.id, 'status', v_redemption.status, 'rejectReason', v_redemption.reject_reason,
    'processedAt', v_redemption.processed_at, 'goldBalance', v_gold);
end;
$$;

revoke all on function public.redeem_reward(uuid), public.approve_reward_redemption(uuid, text), public.reject_reward_redemption(uuid, text) from public, anon;
grant execute on function public.redeem_reward(uuid), public.approve_reward_redemption(uuid, text), public.reject_reward_redemption(uuid, text) to authenticated;
