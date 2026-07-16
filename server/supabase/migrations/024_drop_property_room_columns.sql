-- MIR Housing — drop denormalized / unused columns from properties
-- Room-level fields live on `rooms`. Run in Supabase Dashboard → SQL Editor.
-- Prerequisites: 021_rooms.sql, 023_properties_rooms_connection.sql

-- Ensure active rooms exist for properties that only had denormalized room fields.
insert into public.rooms (
  property_id,
  name,
  room_type,
  floor,
  area_sqm,
  rent_amount,
  rent_currency,
  status,
  holding_deposit,
  deposit_months,
  bedrooms,
  bathrooms,
  description,
  created_by
)
select
  p.id,
  coalesce(nullif(trim(p.name), ''), 'Room') || ' — 1',
  p.room_type,
  p.floor,
  p.area_sqm,
  p.rent_amount,
  p.rent_currency,
  p.status,
  p.holding_deposit,
  p.deposit_months,
  p.bedrooms,
  p.bathrooms,
  p.description,
  p.created_by
from public.properties p
where p.deleted_at is null
  and not exists (
    select 1
    from public.rooms r
    where r.property_id = p.id
      and r.deleted_at is null
  );

alter table public.properties
  drop column if exists rent_amount,
  drop column if exists bedrooms,
  drop column if exists bathrooms,
  drop column if exists area_sqm,
  drop column if exists room_type,
  drop column if exists toilet_type,
  drop column if exists floor,
  drop column if exists deposit_months,
  drop column if exists holding_deposit,
  drop column if exists has_solar_hot_water,
  drop column if exists washing_machine;

-- Enum only used by the dropped toilet_type column.
drop type if exists public.property_toilet_type;
