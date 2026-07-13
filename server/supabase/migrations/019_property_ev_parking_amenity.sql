-- MIR Housing — replace fixed electricity with EV parking amenity
-- Run in Supabase Dashboard → SQL Editor

alter table public.property_furnishings
  add column if not exists has_ev_parking boolean;

alter table public.property_furnishings
  drop column if exists has_fixed_electricity;
