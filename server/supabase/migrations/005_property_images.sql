-- MIR Housing — property images + Supabase Storage bucket
-- Run in Supabase Dashboard → SQL Editor

-- ---------------------------------------------------------------------------
-- Storage bucket
-- ---------------------------------------------------------------------------

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

-- ---------------------------------------------------------------------------
-- property_images metadata
-- ---------------------------------------------------------------------------

create table if not exists public.property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  storage_path text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint property_images_storage_path_unique unique (storage_path)
);

create index if not exists idx_property_images_property_id
  on public.property_images (property_id);

create index if not exists idx_property_images_sort_order
  on public.property_images (property_id, sort_order);

alter table public.property_images enable row level security;

create policy "Authenticated users can read property images"
  on public.property_images
  for select
  to authenticated
  using (true);

create policy "Authenticated users can insert property images"
  on public.property_images
  for insert
  to authenticated
  with check (true);

create policy "Authenticated users can delete property images"
  on public.property_images
  for delete
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- Storage object policies
-- ---------------------------------------------------------------------------

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
