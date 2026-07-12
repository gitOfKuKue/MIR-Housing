-- MIR Housing — amenity flags used by property filters
-- Run in Supabase Dashboard → SQL Editor

alter table public.property_furnishings
  add column if not exists has_car_parking boolean,
  add column if not exists has_bike_parking boolean,
  add column if not exists has_fixed_electricity boolean,
  add column if not exists pets_ok boolean,
  add column if not exists foreigners_ok boolean,
  add column if not exists has_solar_hot_water boolean,
  add column if not exists has_cleaning_service boolean;
