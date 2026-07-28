-- Archive data has no browser consumer. RLS keeps it service-role-only even if
-- the archive schema is exposed accidentally in the future.
do $$
declare archive_table record;
begin
  for archive_table in
    select c.relname
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'archive' and c.relkind in ('r', 'p')
  loop
    execute format('alter table archive.%I enable row level security', archive_table.relname);
  end loop;
end;
$$;
