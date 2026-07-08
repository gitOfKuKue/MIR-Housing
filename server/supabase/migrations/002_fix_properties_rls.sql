-- Fix properties RLS for soft delete
-- Run in Supabase SQL Editor if DELETE /properties/:id fails with RLS error

-- Remove all existing policies on properties (avoids duplicate/conflicting rules)
drop policy if exists "Authenticated users can read properties" on public.properties;
drop policy if exists "Authenticated users can insert properties" on public.properties;
drop policy if exists "Authenticated users can update properties" on public.properties;
drop policy if exists "Authenticated users can soft delete properties" on public.properties;

-- Read active properties only
create policy "Authenticated users can read properties"
  on public.properties
  for select
  to authenticated
  using (deleted_at is null);

-- Create
create policy "Authenticated users can insert properties"
  on public.properties
  for insert
  to authenticated
  with check (true);

-- Edit active properties (cannot set deleted_at via normal patch)
create policy "Authenticated users can update properties"
  on public.properties
  for update
  to authenticated
  using (deleted_at is null)
  with check (deleted_at is null);

-- Soft delete: allow setting deleted_at on active rows only
create policy "Authenticated users can soft delete properties"
  on public.properties
  for update
  to authenticated
  using (deleted_at is null)
  with check (deleted_at is not null);
