-- MIR Housing — water fee billing mode (fixed monthly vs per m³)
-- Run in Supabase Dashboard → SQL Editor

do $$ begin
  create type public.property_fee_water_type as enum ('fixed', 'per_m3');
exception
  when duplicate_object then null;
end $$;

alter table public.properties
  add column if not exists fee_water_type public.property_fee_water_type;
