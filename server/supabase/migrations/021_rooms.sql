-- MIR Housing — rooms (unit-level details, furniture, photos)
-- Run in Supabase Dashboard → SQL Editor
-- A property (building/address) can have many rooms.

-- ---------------------------------------------------------------------------
-- rooms
-- ---------------------------------------------------------------------------

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,

  -- Basic info
  name text,
  room_type text,
  floor text,
  area_sqm numeric(10, 2),
  rent_amount numeric(12, 2),
  rent_currency text not null default 'VND',
  status public.property_status not null default 'available',

  -- Room details
  holding_deposit numeric(12, 2),
  deposit_months integer,
  bedrooms integer,
  bathrooms numeric(4, 1),

  -- Furniture
  has_air_conditioner boolean,
  has_fridge boolean,
  has_wardrobe boolean,
  has_upper_kitchen_cabinet boolean,
  has_lower_kitchen_cabinet boolean,
  has_kitchen_counter boolean,
  has_mattress boolean,
  has_bed boolean,
  has_shoe_cabinet boolean,
  has_window_outdoor_view boolean,
  has_window_corridor boolean,
  has_window_air_well boolean,
  has_balcony boolean,
  has_ventilation_window boolean,
  has_dining_table boolean,
  has_desk boolean,
  has_dressing_table boolean,
  has_sofa boolean,
  has_tv boolean,
  has_range_hood boolean,
  has_hot_water boolean,

  description text,
  internal_notes text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,

  constraint rooms_area_sqm_positive
    check (area_sqm is null or area_sqm > 0),
  constraint rooms_rent_amount_nonneg
    check (rent_amount is null or rent_amount >= 0),
  constraint rooms_holding_deposit_nonneg
    check (holding_deposit is null or holding_deposit >= 0),
  constraint rooms_deposit_months_nonneg
    check (deposit_months is null or deposit_months >= 0),
  constraint rooms_bedrooms_nonneg
    check (bedrooms is null or bedrooms >= 0),
  constraint rooms_bathrooms_nonneg
    check (bathrooms is null or bathrooms >= 0)
);

create index if not exists idx_rooms_property_id
  on public.rooms (property_id);

create index if not exists idx_rooms_status
  on public.rooms (status)
  where deleted_at is null;

create index if not exists idx_rooms_room_type
  on public.rooms (room_type)
  where deleted_at is null;

alter table public.rooms enable row level security;

create policy "Authenticated users can read rooms"
  on public.rooms
  for select
  to authenticated
  using (deleted_at is null);

create policy "Authenticated users can insert rooms"
  on public.rooms
  for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update rooms"
  on public.rooms
  for update
  to authenticated
  using (deleted_at is null)
  with check (true);

create policy "Authenticated users can soft-delete rooms"
  on public.rooms
  for update
  to authenticated
  using (true)
  with check (true);

-- ---------------------------------------------------------------------------
-- room_images (first by sort_order = cover)
-- ---------------------------------------------------------------------------

create table if not exists public.room_images (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms (id) on delete cascade,
  storage_path text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint room_images_storage_path_unique unique (storage_path)
);

create index if not exists idx_room_images_room_id
  on public.room_images (room_id);

create index if not exists idx_room_images_sort_order
  on public.room_images (room_id, sort_order);

alter table public.room_images enable row level security;

create policy "Authenticated users can read room images"
  on public.room_images
  for select
  to authenticated
  using (true);

create policy "Authenticated users can insert room images"
  on public.room_images
  for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update room images"
  on public.room_images
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can delete room images"
  on public.room_images
  for delete
  to authenticated
  using (true);

-- Reuse the existing property-images storage bucket for room photos
-- (paths can be namespaced as rooms/{room_id}/...).
-- If you prefer a separate bucket, create `room-images` in Storage settings.
