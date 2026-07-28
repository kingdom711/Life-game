alter table public.user_quest_completions
  drop constraint user_quest_completions_source_type_check,
  add constraint user_quest_completions_source_type_check
    check (source_type in ('EDUCATION_COMPLETION', 'CHECKLIST_SUBMISSION'));

create or replace function private.record_checklist_daily_quest()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.user_quest_completions(user_id, quest_id, period_date, source_type, source_id)
  values (new.user_id, 'daily_checklist_1',
          (new.submitted_at at time zone 'Asia/Seoul')::date,
          'CHECKLIST_SUBMISSION', new.id)
  on conflict (user_id, quest_id, period_date) do nothing;
  return new;
end;
$$;

create trigger checklist_submission_records_daily_quest
after insert on public.checklists
for each row execute procedure private.record_checklist_daily_quest();
