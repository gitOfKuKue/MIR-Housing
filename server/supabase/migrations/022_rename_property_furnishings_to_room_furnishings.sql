-- MIR Housing — rename property_furnishings → room_furnishings
-- Run in Supabase Dashboard → SQL Editor

alter table if exists public.property_furnishings
  rename to room_furnishings;

alter index if exists public.idx_property_furnishings_property_id
  rename to idx_room_furnishings_property_id;

do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'property_furnishings_pkey'
  ) then
    alter table public.room_furnishings
      rename constraint property_furnishings_pkey to room_furnishings_pkey;
  end if;

  if exists (
    select 1 from pg_constraint
    where conname = 'property_furnishings_property_id_fkey'
  ) then
    alter table public.room_furnishings
      rename constraint property_furnishings_property_id_fkey
      to room_furnishings_property_id_fkey;
  end if;

  if exists (
    select 1 from pg_constraint
    where conname = 'property_furnishings_property_id_key'
  ) then
    alter table public.room_furnishings
      rename constraint property_furnishings_property_id_key
      to room_furnishings_property_id_key;
  end if;
end $$;

drop trigger if exists property_furnishings_updated_at on public.room_furnishings;

create trigger room_furnishings_updated_at
  before update on public.room_furnishings
  for each row
  execute function public.set_updated_at();

drop policy if exists "Authenticated users can read property furnishings"
  on public.room_furnishings;
drop policy if exists "Authenticated users can insert property furnishings"
  on public.room_furnishings;
drop policy if exists "Authenticated users can update property furnishings"
  on public.room_furnishings;
drop policy if exists "Authenticated users can delete property furnishings"
  on public.room_furnishings;

create policy "Authenticated users can read room furnishings"
  on public.room_furnishings
  for select
  to authenticated
  using (true);

create policy "Authenticated users can insert room furnishings"
  on public.room_furnishings
  for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update room furnishings"
  on public.room_furnishings
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can delete room furnishings"
  on public.room_furnishings
  for delete
  to authenticated
  using (true);
