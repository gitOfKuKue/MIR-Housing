-- Fix storage RLS for property image uploads
-- Run in Supabase SQL Editor if image upload fails with
-- "new row violates row-level security policy"

-- Ensure bucket exists
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'property-images',
  'property-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Replace storage policies (idempotent)
drop policy if exists "Authenticated users can upload property images" on storage.objects;
drop policy if exists "Authenticated users can read property image files" on storage.objects;
drop policy if exists "Authenticated users can update property image files" on storage.objects;
drop policy if exists "Authenticated users can delete property image files" on storage.objects;
drop policy if exists "Public can read property image files" on storage.objects;

create policy "Authenticated users can upload property images"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'property-images');

create policy "Authenticated users can read property image files"
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'property-images');

create policy "Authenticated users can update property image files"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'property-images')
  with check (bucket_id = 'property-images');

create policy "Authenticated users can delete property image files"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'property-images');

create policy "Public can read property image files"
  on storage.objects
  for select
  to public
  using (bucket_id = 'property-images');
