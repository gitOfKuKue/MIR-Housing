-- MIR Housing — property room info & amenities
-- Run in Supabase Dashboard → SQL Editor

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.property_toilet_type as enum (
  'private',
  'shared'
);

create type public.property_parking_type as enum (
  'private',
  'shared'
);

create type public.property_main_gate_lock_type as enum (
  'standard',
  'none'
);

create type public.property_drying_area_type as enum (
  'private',
  'shared'
);

-- ---------------------------------------------------------------------------
-- properties columns
-- ---------------------------------------------------------------------------

alter table public.properties
  add column if not exists room_type text,
  add column if not exists toilet_type public.property_toilet_type,
  add column if not exists parking_type public.property_parking_type,
  add column if not exists main_gate_lock public.property_main_gate_lock_type,
  add column if not exists max_occupants integer,
  add column if not exists max_bikes integer,
  add column if not exists floor text,
  add column if not exists drying_area public.property_drying_area_type,
  add column if not exists deposit_months integer,
  add column if not exists holding_deposit numeric(12, 2);

alter table public.properties
  drop constraint if exists properties_max_occupants_nonneg,
  drop constraint if exists properties_max_bikes_nonneg,
  drop constraint if exists properties_deposit_months_nonneg,
  drop constraint if exists properties_holding_deposit_nonneg;

alter table public.properties
  add constraint properties_max_occupants_nonneg
    check (max_occupants is null or max_occupants >= 0),
  add constraint properties_max_bikes_nonneg
    check (max_bikes is null or max_bikes >= 0),
  add constraint properties_deposit_months_nonneg
    check (deposit_months is null or deposit_months >= 0),
  add constraint properties_holding_deposit_nonneg
    check (holding_deposit is null or holding_deposit >= 0);
