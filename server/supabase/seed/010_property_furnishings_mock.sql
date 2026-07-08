-- MIR Housing — mock property furnishings for seeded HCMC properties
-- Prerequisites: migration 010 applied; 009_seed_20_properties_full.sql run
-- Run in Supabase Dashboard → SQL Editor

delete from public.property_furnishings
where property_id in (
  select id
  from public.properties
  where internal_notes like '%SEED:HCMC-20%'
);

insert into public.property_furnishings (
  property_id,
  has_loft,
  has_window,
  has_balcony,
  has_fridge,
  has_tv,
  has_air_conditioner,
  washing_machine,
  has_kitchen_staff,
  has_hot_water,
  has_bed,
  has_mattress,
  has_wardrobe,
  has_pillow,
  has_blanket,
  landlord_in_building,
  has_elevator,
  has_security_guard,
  has_skylight,
  has_pool
)
values
  ('aaaaaaaa-0001-4000-8000-000000000001', false, true, true, true, true, true, 'private', false, true, true, true, true, true, true, false, true, true, false, true),
  ('aaaaaaaa-0001-4000-8000-000000000002', false, true, true, true, true, true, 'private', false, true, true, true, true, true, true, false, true, true, false, true),
  ('aaaaaaaa-0001-4000-8000-000000000003', true, true, true, true, true, true, 'private', true, true, true, true, true, true, true, false, true, true, true, false),
  ('aaaaaaaa-0001-4000-8000-000000000004', false, true, false, true, false, true, 'private', false, true, false, false, false, false, false, false, false, false, false, false),
  ('aaaaaaaa-0001-4000-8000-000000000005', false, true, true, true, true, true, 'shared', false, true, true, true, true, true, true, true, true, true, false, false),
  ('aaaaaaaa-0001-4000-8000-000000000006', false, true, false, true, true, true, 'shared', false, true, true, true, true, true, true, false, true, true, false, true),
  ('aaaaaaaa-0001-4000-8000-000000000007', false, true, true, true, true, true, 'private', true, true, true, true, true, true, true, false, false, true, true, true),
  ('aaaaaaaa-0001-4000-8000-000000000008', false, true, true, true, true, true, 'private', false, true, true, true, true, true, true, false, true, true, false, true),
  ('aaaaaaaa-0001-4000-8000-000000000009', true, true, true, true, true, true, 'shared', false, true, true, true, true, true, true, false, true, true, true, false),
  ('aaaaaaaa-0001-4000-8000-000000000010', false, true, false, true, false, true, 'shared', false, true, false, false, true, false, false, true, false, false, false, false),
  ('aaaaaaaa-0001-4000-8000-000000000011', false, true, true, true, true, true, 'private', false, true, true, true, true, true, true, false, true, true, false, true),
  ('aaaaaaaa-0001-4000-8000-000000000012', false, true, false, true, false, true, 'not_available', false, true, false, false, false, false, false, false, false, false, false, false),
  ('aaaaaaaa-0001-4000-8000-000000000013', false, true, false, true, false, true, 'shared', false, true, true, true, true, true, true, true, true, true, false, false),
  ('aaaaaaaa-0001-4000-8000-000000000014', false, true, true, true, true, true, 'shared', false, true, true, true, true, true, true, false, true, true, false, false),
  ('aaaaaaaa-0001-4000-8000-000000000015', true, true, false, true, false, true, 'shared', false, true, true, true, false, true, true, true, false, false, true, false),
  ('aaaaaaaa-0001-4000-8000-000000000016', false, true, true, true, true, true, 'private', true, true, true, true, true, true, true, false, false, true, true, true),
  ('aaaaaaaa-0001-4000-8000-000000000017', false, true, false, true, true, true, 'shared', false, true, true, true, true, true, true, false, true, true, false, false),
  ('aaaaaaaa-0001-4000-8000-000000000018', false, true, false, true, false, true, 'private', false, true, false, false, true, false, false, true, false, false, false, false),
  ('aaaaaaaa-0001-4000-8000-000000000019', true, true, true, true, true, true, 'private', false, true, true, true, true, true, true, false, true, true, true, true),
  ('aaaaaaaa-0001-4000-8000-000000000020', false, true, true, true, true, true, 'private', false, true, true, true, true, true, true, false, false, true, false, true);
