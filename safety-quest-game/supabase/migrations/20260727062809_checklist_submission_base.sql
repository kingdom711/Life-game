create table public.checklists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  site_name text not null default '현장 A' check (char_length(site_name) between 1 and 200),
  status text not null default 'SUBMITTED' check (status in ('SUBMITTED','APPROVED','REJECTED')),
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create table public.checklist_items (
  id uuid primary key default gen_random_uuid(), checklist_id uuid not null references public.checklists(id) on delete cascade,
  item_key text not null, answer boolean not null, comment text, risk_flag boolean not null default false,
  unique(checklist_id,item_key)
);
alter table public.checklists enable row level security; alter table public.checklist_items enable row level security;
create policy "checklists: owner or manager reads" on public.checklists for select to authenticated using ((select auth.uid())=user_id or (select private.is_manager()));
create policy "checklist items: owner or manager reads" on public.checklist_items for select to authenticated using (exists(select 1 from public.checklists c where c.id=checklist_id and (c.user_id=(select auth.uid()) or (select private.is_manager()))));
grant select on public.checklists,public.checklist_items to authenticated; grant all on public.checklists,public.checklist_items to service_role;
create or replace function public.submit_checklist(p_site_name text,p_items jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare v_user uuid:=auth.uid(); v_id uuid; v_count int;
begin
 if v_user is null then raise exception 'Authentication is required' using errcode='28000'; end if;
 if jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items) not between 8 and 50 then raise exception 'At least eight checklist items are required' using errcode='22023'; end if;
 insert into public.checklists(user_id,site_name) values(v_user,coalesce(nullif(trim(p_site_name),''),'현장 A')) returning id into v_id;
 insert into public.checklist_items(checklist_id,item_key,answer,comment,risk_flag)
 select v_id,trim(x.item_key),x.answer,nullif(trim(x.comment),''),coalesce(x.risk_flag,false) from jsonb_to_recordset(p_items) x(item_key text,answer boolean,comment text,risk_flag boolean) where char_length(trim(x.item_key)) between 1 and 100 and x.answer is not null;
 get diagnostics v_count=row_count; if v_count<>jsonb_array_length(p_items) then raise exception 'Invalid checklist item' using errcode='22023'; end if;
 return jsonb_build_object('id',v_id,'status','SUBMITTED','submittedAt',now());
end; $$;
revoke all on function public.submit_checklist(text,jsonb) from public,anon; grant execute on function public.submit_checklist(text,jsonb) to authenticated;
