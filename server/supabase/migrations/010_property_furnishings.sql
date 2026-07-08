-- MIR Housing — property furnishings (1:1 per property)
-- Run in Supabase Dashboard → SQL Editor

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.property_washing_machine_type as enum (
  'private',
  'shared',
  'not_available'
);

-- ---------------------------------------------------------------------------
-- property_furnishings
-- ---------------------------------------------------------------------------

create table if not exists public.property_furnishings (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null unique references public.properties (id) on delete cascade,
  has_loft boolean,
  has_window boolean,
  has_balcony boolean,
  has_fridge boolean,
  has_tv boolean,
  has_air_conditioner boolean,
  washing_machine public.property_washing_machine_type,
  has_kitchen_staff boolean,
  has_hot_water boolean,
  has_bed boolean,
  has_mattress boolean,
  has_wardrobe boolean,
  has_pillow boolean,
  has_blanket boolean,
  landlord_in_building boolean,
  has_elevator boolean,
  has_security_guard boolean,
  has_skylight boolean,
  has_pool boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_property_furnishings_property_id
  on public.property_furnishings (property_id);

alter table public.property_furnishings enable row level security;

create policy "Authenticated users can read property furnishings"
  on public.property_furnishings
  for select
  to authenticated
  using (true);

create policy "Authenticated users can insert property furnishings"
  on public.property_furnishings
  for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update property furnishings"
  on public.property_furnishings
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can delete property furnishings"
  on public.property_furnishings
  for delete
  to authenticated
  using (true);

create trigger property_furnishings_updated_at
  before update on public.property_furnishings
  for each row
  execute function public.set_updated_at();
