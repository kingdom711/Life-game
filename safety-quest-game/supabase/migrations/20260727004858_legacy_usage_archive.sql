-- Immutable logical archive for legacy Spring/Cloudtype usage data.
-- The archive schema is intentionally outside the Data API and has no client grants.

create schema archive;
revoke all on schema archive from public;

create table archive.legacy_usage_manifest (
  source_table text primary key,
  archived_table text not null unique,
  row_count bigint not null,
  archived_at timestamptz not null default now()
);

-- Password hashes are intentionally excluded. Authentication is recreated in
-- Supabase Auth; this snapshot only preserves identity and usage information.
create table archive.legacy_users as
select
  id,
  created_at,
  updated_at,
  email,
  name,
  role,
  username,
  phone_number,
  is_verified,
  team_id
from public.users;

insert into archive.legacy_usage_manifest (source_table, archived_table, row_count)
select 'users', 'legacy_users', count(*) from archive.legacy_users;

do $$
declare
  source_name text;
  archived_name text;
  copied_rows bigint;
begin
  foreach source_name in array array[
    'activity_logs',
    'attendance_records',
    'education_completions',
    'education_watch_logs',
    'gold_transactions',
    'point_transactions',
    'quiz_attempt_logs',
    'team_members',
    'team_quest_progress',
    'user_attendance_rewards',
    'user_game_profiles',
    'user_gold',
    'user_inventory_items',
    'user_points',
    'user_rewards',
    'user_specializations',
    'user_streaks'
  ]
  loop
    archived_name := 'legacy_' || source_name;
    execute format('create table archive.%I as table public.%I', archived_name, source_name);
    execute format('select count(*) from archive.%I', archived_name) into copied_rows;

    insert into archive.legacy_usage_manifest (source_table, archived_table, row_count)
    values (source_name, archived_name, copied_rows);
  end loop;
end;
$$;

revoke all on all tables in schema archive from public, anon, authenticated;
grant usage on schema archive to service_role;
grant select on all tables in schema archive to service_role;
