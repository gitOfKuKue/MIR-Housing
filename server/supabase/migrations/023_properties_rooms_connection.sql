-- MIR Housing — connect properties → rooms; drop room_furnishings
-- Run in Supabase Dashboard → SQL Editor
-- Prerequisites: 021_rooms.sql applied (rooms + room_images)

-- Building-level amenities live on properties (not per-room furniture).
alter table public.properties
  add column if not exists has_elevator boolean,
  add column if not exists has_security_guard boolean,
  add column if not exists has_car_parking boolean,
  add column if not exists has_bike_parking boolean,
  add column if not exists has_ev_parking boolean,
  add column if not exists pets_ok boolean,
  add column if not exists foreigners_ok boolean,
  add column if not exists has_solar_hot_water boolean,
  add column if not exists has_cleaning_service boolean,
  add column if not exists washing_machine public.property_washing_machine_type,
  add column if not exists landlord_in_building boolean;

-- Furniture belongs on rooms only.
drop table if exists public.room_furnishings cascade;
drop table if exists public.property_furnishings cascade;
