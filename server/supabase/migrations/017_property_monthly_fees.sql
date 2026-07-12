-- MIR Housing — monthly fee rate notes on properties
-- Run in Supabase Dashboard → SQL Editor

alter table public.properties
  add column if not exists fee_electricity text,
  add column if not exists fee_water text,
  add column if not exists fee_motorbike text,
  add column if not exists fee_car text,
  add column if not exists fee_wifi text,
  add column if not exists fee_management text,
  add column if not exists fee_service text;
