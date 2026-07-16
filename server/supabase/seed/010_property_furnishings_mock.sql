-- MIR Housing — mock rooms for seeded HCMC properties
-- Prerequisites: migrations 021–024 applied; 009_seed_20_properties_full.sql run
-- Run in Supabase Dashboard → SQL Editor

delete from public.rooms
where property_id in (
  select id
  from public.properties
  where internal_notes like '%SEED:HCMC-20%'
);

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
  has_hot_water
)
select
  v.property_id,
  v.name,
  v.room_type,
  v.floor,
  v.area_sqm,
  v.rent_amount,
  v.rent_currency,
  v.status::public.property_status,
  v.holding_deposit,
  v.deposit_months,
  v.bedrooms,
  v.bathrooms,
  v.description,
  true, true, true, true, true, true, true, true, true,
  true, false, false, true, false, true, true, false, true, true, true, true
from (
  values
    ('aaaaaaaa-0001-4000-8000-000000000001'::uuid, 'Saigon Pearl Tower - Unit 12A', '2_bedroom', '12', 78::numeric, 28000000::numeric, 'VND', 'available', 56000000::numeric, 2, 2, 2::numeric, 'Modern 2BR condo with river view in Binh Thanh District.'),
    ('aaaaaaaa-0001-4000-8000-000000000002'::uuid, 'Vinhomes Central Park - Landmark 6', '2_bedroom', '25', 95, 35000000, 'VND', 'rented', 70000000, 2, 3, 2, 'Spacious apartment overlooking Central Park in Binh Thanh.'),
    ('aaaaaaaa-0001-4000-8000-000000000003'::uuid, 'The Manor - Duplex 8B', 'duplex', '8', 120, 42000000, 'VND', 'available', 84000000, 2, 3, 2.5, 'Duplex unit with premium finishes near Thu Thiem.'),
    ('aaaaaaaa-0001-4000-8000-000000000004'::uuid, 'District 1 Heritage Shophouse', 'ground_plus_one', 'Ground + 3', 180, 55000000, 'VND', 'available', 165000000, 3, 4, 3, 'Renovated shophouse in the heart of District 1.'),
    ('aaaaaaaa-0001-4000-8000-000000000005'::uuid, 'Masteri Thao Dien - Unit 15.08', '2_bedroom', '15', 72, 22000000, 'VND', 'available', 44000000, 2, 2, 2, 'Bright apartment in expat-friendly Thao Dien area.'),
    ('aaaaaaaa-0001-4000-8000-000000000006'::uuid, 'Sunrise City South - S4.12', '2_bedroom', '12', 68, 18000000, 'VND', 'maintenance', 36000000, 2, 2, 1, 'Affordable 2BR condo in District 7.'),
    ('aaaaaaaa-0001-4000-8000-000000000007'::uuid, 'Palm Heights Villa', '2_bedroom', '2 floors', 320, 75000000, 'VND', 'available', 225000000, 3, 5, 4, 'Luxury villa with private garden in Phu My Hung.'),
    ('aaaaaaaa-0001-4000-8000-000000000008'::uuid, 'City Garden - Block A Unit 6', '2_bedroom', '6', 105, 30000000, 'VND', 'rented', 60000000, 2, 3, 2, 'Family apartment with pool and gym in Binh Thanh.'),
    ('aaaaaaaa-0001-4000-8000-000000000009'::uuid, 'The Ascent - Loft 22', 'duplex', '22', 85, 26000000, 'VND', 'available', 52000000, 2, 2, 2, 'Stylish loft unit in Thao Dien with city views.'),
    ('aaaaaaaa-0001-4000-8000-000000000010'::uuid, 'District 3 Townhouse', 'ground_plus_one', '3 floors', 140, 32000000, 'VND', 'available', 64000000, 2, 3, 2.5, 'Three-story townhouse near District 1 border.'),
    ('aaaaaaaa-0001-4000-8000-000000000011'::uuid, 'Estella Heights - T3.18', '2_bedroom', '18', 74, 24000000, 'VND', 'available', 48000000, 2, 2, 2, 'High-floor unit in An Phu with resort-style amenities.'),
    ('aaaaaaaa-0001-4000-8000-000000000012'::uuid, 'Saigon South Campus Housing', '2_bedroom', '1', 110, 20000000, 'VND', 'inactive', 40000000, 2, 3, 2, 'Quiet residential house near Saigon South office park.'),
    ('aaaaaaaa-0001-4000-8000-000000000013'::uuid, 'Feliz En Vista - C1.09', '1_bedroom', '9', 52, 19000000, 'VND', 'available', 19000000, 1, 1, 1, 'Compact 1BR ideal for young professionals in District 2.'),
    ('aaaaaaaa-0001-4000-8000-000000000014'::uuid, 'Rivergate Residence - 20F', '2_bedroom', '20', 80, 27000000, 'VND', 'rented', 54000000, 2, 2, 2, 'River-view apartment in District 4.'),
    ('aaaaaaaa-0001-4000-8000-000000000015'::uuid, 'Thu Duc Studio Loft', 'studio', '5', 38, 9000000, 'VND', 'available', 9000000, 1, 1, 1, 'Budget studio near Thu Duc university area.'),
    ('aaaaaaaa-0001-4000-8000-000000000016'::uuid, 'Diamond Island - Villa 15', '2_bedroom', '3 floors', 400, 90000000, 'VND', 'available', 270000000, 3, 5, 5, 'Premium waterfront villa on Diamond Island, District 2.'),
    ('aaaaaaaa-0001-4000-8000-000000000017'::uuid, 'Sky Garden - M1.14', '2_bedroom', '14', 65, 17000000, 'VND', 'available', 34000000, 2, 2, 1, 'Affordable condo near Tan Son Nhat Airport.'),
    ('aaaaaaaa-0001-4000-8000-000000000018'::uuid, 'District 10 Family Home', '2_bedroom', '2', 160, 25000000, 'VND', 'maintenance', 50000000, 2, 4, 3, 'Traditional Vietnamese house with modern kitchen upgrade.'),
    ('aaaaaaaa-0001-4000-8000-000000000019'::uuid, 'Icon 56 - Penthouse P2', '2_bedroom', 'Penthouse', 150, 65000000, 'VND', 'available', 195000000, 3, 3, 3, 'Penthouse with panoramic Saigon River views.'),
    ('aaaaaaaa-0001-4000-8000-000000000020'::uuid, 'Green Valley Townhouse', 'ground_plus_one', '3 floors', 175, 38000000, 'VND', 'available', 76000000, 2, 4, 3, 'Gated community townhouse in District 7.')
) as v(
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
  description
);
