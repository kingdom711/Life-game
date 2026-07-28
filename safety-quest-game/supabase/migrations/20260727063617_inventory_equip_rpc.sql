-- Remote migration version: 20260727063617.
create or replace function public.set_inventory_item_equipped(p_item_id text, p_equipped boolean)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_user_id uuid := auth.uid(); v_category text;
begin
  if v_user_id is null then raise exception 'Authentication required' using errcode='28000'; end if;
  select category into v_category from public.shop_items where id=p_item_id and is_active;
  if v_category is null then raise exception 'Unknown or inactive item'; end if;
  if not exists (select 1 from public.user_inventory_items where user_id=v_user_id and item_id=p_item_id) then
    raise exception 'Item is not owned';
  end if;
  if p_equipped then
    update public.user_inventory_items i set is_equipped=false
      where i.user_id=v_user_id and i.item_id in (select id from public.shop_items where category=v_category);
  end if;
  update public.user_inventory_items set is_equipped=p_equipped where user_id=v_user_id and item_id=p_item_id;
  return jsonb_build_object('itemId',p_item_id,'equipped',p_equipped);
end; $$;
revoke all on function public.set_inventory_item_equipped(text,boolean) from public,anon;
grant execute on function public.set_inventory_item_equipped(text,boolean) to authenticated;
