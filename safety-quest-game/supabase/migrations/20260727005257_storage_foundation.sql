-- Phase 1c: private photo and generated-document storage.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'safety-road-photos',
  'safety-road-photos',
  false,
  52428800,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public)
values ('generated-docs', 'generated-docs', false)
on conflict (id) do update set public = excluded.public;
