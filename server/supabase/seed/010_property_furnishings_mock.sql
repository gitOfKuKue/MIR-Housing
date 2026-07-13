-- MIR Housing — mock property furnishings for seeded HCMC properties
-- Prerequisites: migrations 010 + 015–020 applied; 009_seed_20_properties_full.sql run
-- Run in Supabase Dashboard → SQL Editor

delete from public.property_furnishings
where property_id in (
  select id
  from public.properties
  where internal_notes like '%SEED:HCMC-20%'
);

insert into public.property_furnishings (
  property_id,
  has_air_conditioner,
  has_fridge,
  has_wardrobe,
  has_upper_kitchen_cabinet,
  has_lower_kitchen_cabinet,
  has_kitchen_counter,
  has_mattress,
  has_bed,
  has_shoe_cabinet,
  has_window_outdoor_view,
  has_window_corridor,
  has_window_air_well,
  has_balcony,
  has_ventilation_window,
  has_dining_table,
  has_desk,
  has_dressing_table,
  has_sofa,
  has_tv,
  has_range_hood,
  has_hot_water,
  washing_machine,
  landlord_in_building,
  has_elevator,
  has_security_guard,
  has_car_parking,
  has_bike_parking,
  has_ev_parking,
  pets_ok,
  foreigners_ok,
  has_solar_hot_water,
  has_cleaning_service
)
values
  ('aaaaaaaa-0001-4000-8000-000000000001', true, true, true, true, true, true, true, true, true, true, false, false, true, false, true, true, false, true, true, true, true, 'private', false, true, true, true, true, false, true, true, false, true),
  ('aaaaaaaa-0001-4000-8000-000000000002', true, true, true, true, true, true, true, true, true, true, false, false, true, false, true, true, false, true, true, true, true, 'private', false, true, true, true, true, false, true, true, false, true),
  ('aaaaaaaa-0001-4000-8000-000000000003', true, true, true, true, true, true, true, true, false, true, false, false, true, true, true, true, true, true, true, true, true, 'private', false, true, true, true, true, true, true, true, true, false),
  ('aaaaaaaa-0001-4000-8000-000000000004', true, true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, false, false, false, true, 'private', false, false, false, false, true, false, false, false, false, false),
  ('aaaaaaaa-0001-4000-8000-000000000005', true, true, true, true, true, true, true, true, true, true, false, false, true, false, true, false, false, true, true, true, true, 'shared', true, true, true, false, true, false, true, true, true, true),
  ('aaaaaaaa-0001-4000-8000-000000000006', true, true, true, false, true, true, true, true, true, false, true, false, false, false, true, true, false, true, true, false, true, 'shared', false, true, true, true, true, true, false, true, false, true),
  ('aaaaaaaa-0001-4000-8000-000000000007', true, true, true, true, true, true, true, true, true, true, false, false, true, false, true, true, true, true, true, true, true, 'private', false, false, true, true, true, false, true, true, true, true),
  ('aaaaaaaa-0001-4000-8000-000000000008', true, true, true, true, true, true, true, true, true, true, false, false, true, false, true, true, false, true, true, true, true, 'private', false, true, true, true, true, false, true, true, false, true),
  ('aaaaaaaa-0001-4000-8000-000000000009', true, true, true, true, true, true, true, true, false, true, false, true, true, true, true, true, false, true, true, true, true, 'shared', false, true, true, true, true, false, true, true, true, false),
  ('aaaaaaaa-0001-4000-8000-000000000010', true, true, true, false, false, false, false, false, false, false, true, false, false, false, false, true, false, false, false, false, true, 'shared', true, false, false, false, true, false, false, false, false, false),
  ('aaaaaaaa-0001-4000-8000-000000000011', true, true, true, true, true, true, true, true, true, true, false, false, true, false, true, true, false, true, true, true, true, 'private', false, true, true, true, true, false, true, true, false, true),
  ('aaaaaaaa-0001-4000-8000-000000000012', true, true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, false, false, false, true, 'not_available', false, false, false, false, true, false, false, false, false, false),
  ('aaaaaaaa-0001-4000-8000-000000000013', true, true, true, false, true, true, true, true, true, false, true, false, false, false, false, true, false, false, false, false, true, 'shared', true, true, true, false, true, false, true, true, true, true),
  ('aaaaaaaa-0001-4000-8000-000000000014', true, true, true, true, true, true, true, true, true, true, false, false, true, false, true, false, false, true, true, true, true, 'shared', false, true, true, false, true, false, true, true, false, false),
  ('aaaaaaaa-0001-4000-8000-000000000015', true, true, false, false, false, false, true, true, false, false, false, true, false, true, false, true, false, false, false, false, true, 'shared', true, false, false, false, true, false, false, false, true, false),
  ('aaaaaaaa-0001-4000-8000-000000000016', true, true, true, true, true, true, true, true, true, true, false, false, true, false, true, true, true, true, true, true, true, 'private', false, false, true, true, true, false, true, true, true, true),
  ('aaaaaaaa-0001-4000-8000-000000000017', true, true, true, false, true, true, true, true, true, false, true, false, false, false, true, true, false, true, true, false, true, 'shared', false, true, true, false, true, true, false, true, false, false),
  ('aaaaaaaa-0001-4000-8000-000000000018', true, true, true, false, false, false, false, false, false, false, true, false, false, false, false, true, false, false, false, false, true, 'private', true, false, false, false, true, false, false, false, false, false),
  ('aaaaaaaa-0001-4000-8000-000000000019', true, true, true, true, true, true, true, true, true, true, false, false, true, true, true, true, true, true, true, true, true, 'private', false, true, true, true, true, true, true, true, true, true),
  ('aaaaaaaa-0001-4000-8000-000000000020', true, true, true, true, true, true, true, true, true, true, false, false, true, false, true, true, false, true, true, true, true, 'private', false, false, true, true, true, false, true, true, false, true);
