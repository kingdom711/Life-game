-- Maintenance-window reset. Legacy rows are preserved in the non-exposed
-- archive schema; the new Auth-backed profiles table remains in place.
do $$
declare
  legacy_table record;
begin
  for legacy_table in
    select c.relname
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind in ('r', 'p')
      and c.relname <> 'profiles'
  loop
    execute format('drop table public.%I cascade', legacy_table.relname);
  end loop;
end;
$$;
