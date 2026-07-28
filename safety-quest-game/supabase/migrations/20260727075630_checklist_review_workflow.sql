create table public.checklist_review_logs (
  id uuid primary key default gen_random_uuid(),
  checklist_id uuid not null references public.checklists(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id),
  reviewer_role public.app_role not null,
  action text not null check (action in ('APPROVE', 'REJECT')),
  comment text check (char_length(comment) <= 1000),
  previous_status text not null check (previous_status in ('SUBMITTED', 'APPROVED', 'REJECTED')),
  new_status text not null check (new_status in ('SUBMITTED', 'APPROVED', 'REJECTED')),
  reviewed_at timestamptz not null default now()
);
create index checklist_review_logs_checklist_reviewed_idx
  on public.checklist_review_logs(checklist_id, reviewed_at desc);
create index checklist_review_logs_reviewer_reviewed_idx
  on public.checklist_review_logs(reviewer_id, reviewed_at desc);

alter table public.checklist_review_logs enable row level security;
create policy "checklist reviews: owner or manager reads"
  on public.checklist_review_logs for select to authenticated
  using (
    (select private.is_manager())
    or exists (
      select 1 from public.checklists c
      where c.id = checklist_id and c.user_id = (select auth.uid())
    )
  );
grant select on public.checklist_review_logs to authenticated;
grant all on public.checklist_review_logs to service_role;

create or replace function public.review_checklist(
  p_checklist_id uuid,
  p_action text,
  p_comment text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_reviewer_id uuid := auth.uid();
  v_checklist public.checklists;
  v_role public.app_role;
  v_new_status text;
  v_log public.checklist_review_logs;
begin
  if v_reviewer_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;
  if not (select private.is_manager()) then
    raise exception 'A manager role is required' using errcode = '42501';
  end if;
  if p_action not in ('APPROVE', 'REJECT') then
    raise exception 'Invalid review action' using errcode = '22023';
  end if;
  if char_length(coalesce(p_comment, '')) > 1000 then
    raise exception 'Review comment is too long' using errcode = '22023';
  end if;

  select * into v_checklist
    from public.checklists
   where id = p_checklist_id
   for update;
  if not found then
    raise exception 'Checklist was not found' using errcode = 'P0002';
  end if;
  if v_checklist.status <> 'SUBMITTED' then
    raise exception 'Only submitted checklists can be reviewed' using errcode = 'P0001';
  end if;
  if v_checklist.user_id = v_reviewer_id then
    raise exception 'You cannot review your own checklist' using errcode = '42501';
  end if;

  select role into v_role from public.profiles where id = v_reviewer_id;
  if v_role is null then
    raise exception 'Reviewer profile was not found' using errcode = 'P0002';
  end if;
  v_new_status := case when p_action = 'APPROVE' then 'APPROVED' else 'REJECTED' end;

  update public.checklists set status = v_new_status where id = p_checklist_id;
  insert into public.checklist_review_logs(
    checklist_id, reviewer_id, reviewer_role, action, comment, previous_status, new_status
  ) values (
    p_checklist_id, v_reviewer_id, v_role, p_action, nullif(trim(p_comment), ''), 'SUBMITTED', v_new_status
  ) returning * into v_log;

  return jsonb_build_object(
    'id', v_log.id,
    'checklistId', v_log.checklist_id,
    'reviewerId', v_log.reviewer_id,
    'reviewerRole', v_log.reviewer_role,
    'action', v_log.action,
    'comment', v_log.comment,
    'previousStatus', v_log.previous_status,
    'newStatus', v_log.new_status,
    'reviewedAt', v_log.reviewed_at
  );
end;
$$;

revoke all on function public.review_checklist(uuid, text, text) from public, anon;
grant execute on function public.review_checklist(uuid, text, text) to authenticated;
