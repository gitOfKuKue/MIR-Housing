-- MIR Housing — redesign property furniture flags
-- Run in Supabase Dashboard → SQL Editor

alter table public.property_furnishings
  add column if not exists has_upper_kitchen_cabinet boolean,
  add column if not exists has_lower_kitchen_cabinet boolean,
  add column if not exists has_kitchen_counter boolean,
  add column if not exists has_shoe_cabinet boolean,
  add column if not exists has_window_outdoor_view boolean,
  add column if not exists has_window_corridor boolean,
  add column if not exists has_window_air_well boolean,
  add column if not exists has_ventilation_window boolean,
  add column if not exists has_dining_table boolean,
  add column if not exists has_desk boolean,
  add column if not exists has_dressing_table boolean,
  add column if not exists has_sofa boolean,
  add column if not exists has_range_hood boolean;

alter table public.property_furnishings
  drop column if exists has_loft,
  drop column if exists has_window,
  drop column if exists has_pillow,
  drop column if exists has_blanket,
  drop column if exists has_kitchen_staff,
  drop column if exists has_skylight,
  drop column if exists has_pool;
