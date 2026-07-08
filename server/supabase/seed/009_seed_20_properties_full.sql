-- MIR Housing — full seed: 20 HCMC properties + room info + utility bills + image metadata
-- Prerequisites: migrations 001–006 and 008 applied; at least one auth.users row exists
-- Run in Supabase Dashboard → SQL Editor
--
-- Creates:
--   • 20 properties (fixed UUIDs)
--   • 3 property_images rows per property (60 total) — metadata only
--   • 7 utility bill types per property for March 2026 (140 total)
--
-- Images: metadata is inserted here. SQL cannot upload binary files to Storage.
-- After this script, run from server/:
--   npm run seed:images
-- (requires SUPABASE_SERVICE_ROLE_KEY in server/src/.env, or SEED_EMAIL + SEED_PASSWORD)

-- ---------------------------------------------------------------------------
-- Optional cleanup (re-run safe)
-- ---------------------------------------------------------------------------

delete from public.property_images
where storage_path like 'seed/%';

delete from public.property_utility_bills
where notes like 'SEED:HCMC-20%';

delete from public.properties
where internal_notes like '%SEED:HCMC-20%';

-- ---------------------------------------------------------------------------
-- Properties
-- ---------------------------------------------------------------------------

with seed_user as (
  select id as user_id
  from auth.users
  order by created_at
  limit 1
)
insert into public.properties (
  id,
  name,
  property_type,
  status,
  address_line1,
  address_line2,
  city,
  province,
  postal_code,
  country,
  rent_amount,
  rent_currency,
  bedrooms,
  bathrooms,
  area_sqm,
  description,
  internal_notes,
  created_by,
  room_type,
  toilet_type,
  parking_type,
  main_gate_lock,
  max_occupants,
  max_bikes,
  floor,
  drying_area,
  deposit_months,
  holding_deposit
)
select
  v.id,
  v.name,
  v.property_type::public.property_type,
  v.status::public.property_status,
  v.address_line1,
  v.address_line2,
  v.city,
  v.province,
  v.postal_code,
  v.country,
  v.rent_amount,
  v.rent_currency,
  v.bedrooms,
  v.bathrooms,
  v.area_sqm,
  v.description,
  v.internal_notes || ' | SEED:HCMC-20',
  su.user_id,
  v.room_type,
  v.toilet_type::public.property_toilet_type,
  v.parking_type::public.property_parking_type,
  v.main_gate_lock::public.property_main_gate_lock_type,
  v.max_occupants,
  v.max_bikes,
  v.floor,
  v.drying_area::public.property_drying_area_type,
  v.deposit_months,
  v.holding_deposit
from seed_user su
cross join (
  values
    ('aaaaaaaa-0001-4000-8000-000000000001'::uuid, 'Saigon Pearl Tower - Unit 12A', 'condo', 'available', '92 Nguyen Huu Canh', 'Tower 1, Floor 12', 'Ho Chi Minh City', 'Ho Chi Minh', '700000', 'VN', 28000000, 'VND', 2, 2, 78, 'Modern 2BR condo with river view in Binh Thanh District.', 'Pet-friendly building. 2-month deposit required.', '2BR Deluxe', 'private', 'shared', 'standard', 4, 2, '12', 'shared', 2, 56000000),
    ('aaaaaaaa-0001-4000-8000-000000000002'::uuid, 'Vinhomes Central Park - Landmark 6', 'apartment', 'rented', '208 Nguyen Huu Canh', 'Unit 2505', 'Ho Chi Minh City', 'Ho Chi Minh', '700000', 'VN', 35000000, 'VND', 3, 2, 95, 'Spacious apartment overlooking Central Park in Binh Thanh.', 'Tenant lease ends December 2026.', '3BR Park View', 'private', 'private', 'standard', 6, 2, '25', 'private', 2, 70000000),
    ('aaaaaaaa-0001-4000-8000-000000000003'::uuid, 'The Manor - Duplex 8B', 'condo', 'available', '91 Nguyen Huu Canh', 'Block B, Unit 8B', 'Ho Chi Minh City', 'Ho Chi Minh', '700000', 'VN', 42000000, 'VND', 3, 2.5, 120, 'Duplex unit with premium finishes near Thu Thiem.', 'Includes 1 parking slot.', 'Duplex Premium', 'private', 'private', 'standard', 6, 1, '8', 'private', 2, 84000000),
    ('aaaaaaaa-0001-4000-8000-000000000004'::uuid, 'District 1 Heritage Shophouse', 'house', 'available', '45 Le Loi Boulevard', 'Ward Ben Nghe', 'Ho Chi Minh City', 'Ho Chi Minh', '700000', 'VN', 55000000, 'VND', 4, 3, 180, 'Renovated shophouse in the heart of District 1.', 'Suitable for expat family. No commercial use.', '4BR Shophouse', 'private', 'private', 'standard', 8, 4, 'Ground + 3', 'private', 3, 165000000),
    ('aaaaaaaa-0001-4000-8000-000000000005'::uuid, 'Masteri Thao Dien - Unit 15.08', 'apartment', 'available', '159 Xa Lo Ha Noi', 'Tower T2, Unit 15.08', 'Ho Chi Minh City', 'Ho Chi Minh', '700000', 'VN', 22000000, 'VND', 2, 2, 72, 'Bright apartment in expat-friendly Thao Dien area.', 'Walking distance to An Phu supermarket.', '2BR Standard', 'private', 'shared', 'standard', 4, 2, '15', 'shared', 2, 44000000),
    ('aaaaaaaa-0001-4000-8000-000000000006'::uuid, 'Sunrise City South - S4.12', 'condo', 'maintenance', '27 Nguyen Huu Tho', 'Block S4, Unit 12', 'Ho Chi Minh City', 'Ho Chi Minh', '700000', 'VN', 18000000, 'VND', 2, 1, 68, 'Affordable 2BR condo in District 7.', 'AC replacement scheduled. Available from next month.', '2BR Economy', 'private', 'shared', 'standard', 3, 2, '12', 'shared', 2, 36000000),
    ('aaaaaaaa-0001-4000-8000-000000000007'::uuid, 'Palm Heights Villa', 'house', 'available', '18 Street 12, Phu My Hung', 'Villa 8', 'Ho Chi Minh City', 'Ho Chi Minh', '700000', 'VN', 75000000, 'VND', 5, 4, 320, 'Luxury villa with private garden in Phu My Hung.', 'Includes maid quarters. Minimum 2-year lease.', '5BR Villa', 'private', 'private', 'standard', 10, 6, '2 floors', 'private', 3, 225000000),
    ('aaaaaaaa-0001-4000-8000-000000000008'::uuid, 'City Garden - Block A Unit 6', 'apartment', 'rented', '59 Ngo Tat To', 'Block A, Unit 6', 'Ho Chi Minh City', 'Ho Chi Minh', '700000', 'VN', 30000000, 'VND', 3, 2, 105, 'Family apartment with pool and gym in Binh Thanh.', 'Long-term tenant since 2024.', '3BR Family', 'private', 'private', 'standard', 6, 3, '6', 'private', 2, 60000000),
    ('aaaaaaaa-0001-4000-8000-000000000009'::uuid, 'The Ascent - Loft 22', 'condo', 'available', '33 Quoc Huong', 'Loft 22', 'Ho Chi Minh City', 'Ho Chi Minh', '700000', 'VN', 26000000, 'VND', 2, 2, 85, 'Stylish loft unit in Thao Dien with city views.', 'Fully furnished option available.', 'Loft 2BR', 'private', 'shared', 'standard', 4, 2, '22', 'private', 2, 52000000),
    ('aaaaaaaa-0001-4000-8000-000000000010'::uuid, 'District 3 Townhouse', 'townhouse', 'available', '120 Vo Thi Sau', 'House 3', 'Ho Chi Minh City', 'Ho Chi Minh', '700000', 'VN', 32000000, 'VND', 3, 2.5, 140, 'Three-story townhouse near District 1 border.', 'Motorbike parking in alley.', '3BR Townhouse', 'private', 'shared', 'standard', 6, 4, '3 floors', 'private', 2, 64000000),
    ('aaaaaaaa-0001-4000-8000-000000000011'::uuid, 'Estella Heights - T3.18', 'apartment', 'available', '88 Song Hanh', 'Tower 3, Unit 18', 'Ho Chi Minh City', 'Ho Chi Minh', '700000', 'VN', 24000000, 'VND', 2, 2, 74, 'High-floor unit in An Phu with resort-style amenities.', 'Corner unit with extra windows.', '2BR Corner', 'private', 'private', 'standard', 4, 2, '18', 'private', 2, 48000000),
    ('aaaaaaaa-0001-4000-8000-000000000012'::uuid, 'Saigon South Campus Housing', 'house', 'inactive', '7 Street 19, Him Lam', 'Lot 12', 'Ho Chi Minh City', 'Ho Chi Minh', '700000', 'VN', 20000000, 'VND', 3, 2, 110, 'Quiet residential house near Saigon South office park.', 'Off market until owner returns from abroad.', '3BR House', 'private', 'private', 'standard', 5, 3, '1', 'private', 2, 40000000),
    ('aaaaaaaa-0001-4000-8000-000000000013'::uuid, 'Feliz En Vista - C1.09', 'condo', 'available', '1 Mai Chi Tho', 'Block C1, Unit 09', 'Ho Chi Minh City', 'Ho Chi Minh', '700000', 'VN', 19000000, 'VND', 1, 1, 52, 'Compact 1BR ideal for young professionals in District 2.', 'Near metro station (planned).', '1BR Compact', 'private', 'shared', 'standard', 2, 1, '9', 'shared', 1, 19000000),
    ('aaaaaaaa-0001-4000-8000-000000000014'::uuid, 'Rivergate Residence - 20F', 'apartment', 'rented', '151 Ben Van Don', 'Floor 20', 'Ho Chi Minh City', 'Ho Chi Minh', '700000', 'VN', 27000000, 'VND', 2, 2, 80, 'River-view apartment in District 4.', 'Tenant works at nearby office tower.', '2BR River View', 'private', 'shared', 'standard', 4, 2, '20', 'shared', 2, 54000000),
    ('aaaaaaaa-0001-4000-8000-000000000015'::uuid, 'Thu Duc Studio Loft', 'other', 'available', '45 Vo Van Ngan', 'Studio 5', 'Ho Chi Minh City', 'Ho Chi Minh', '700000', 'VN', 9000000, 'VND', 1, 1, 38, 'Budget studio near Thu Duc university area.', 'Student-friendly. 6-month lease minimum.', 'Studio', 'shared', 'shared', 'none', 2, 1, '5', 'shared', 1, 9000000),
    ('aaaaaaaa-0001-4000-8000-000000000016'::uuid, 'Diamond Island - Villa 15', 'house', 'available', '1 Street 2, Diamond Island', 'Villa 15', 'Ho Chi Minh City', 'Ho Chi Minh', '700000', 'VN', 90000000, 'VND', 5, 5, 400, 'Premium waterfront villa on Diamond Island, District 2.', 'Includes private pool. Viewing by appointment only.', '5BR Waterfront Villa', 'private', 'private', 'standard', 10, 4, '3 floors', 'private', 3, 270000000),
    ('aaaaaaaa-0001-4000-8000-000000000017'::uuid, 'Sky Garden - M1.14', 'condo', 'available', '9 Pho Quang', 'Block M1, Unit 14', 'Ho Chi Minh City', 'Ho Chi Minh', '700000', 'VN', 17000000, 'VND', 2, 1, 65, 'Affordable condo near Tan Son Nhat Airport.', 'Some aircraft noise expected.', '2BR Standard', 'private', 'shared', 'standard', 3, 2, '14', 'shared', 2, 34000000),
    ('aaaaaaaa-0001-4000-8000-000000000018'::uuid, 'District 10 Family Home', 'house', 'maintenance', '256 Le Hong Phong', 'Ward 4', 'Ho Chi Minh City', 'Ho Chi Minh', '700000', 'VN', 25000000, 'VND', 4, 3, 160, 'Traditional Vietnamese house with modern kitchen upgrade.', 'Roof repair in progress. Ready in 3 weeks.', '4BR Family Home', 'private', 'private', 'standard', 8, 4, '2', 'private', 2, 50000000),
    ('aaaaaaaa-0001-4000-8000-000000000019'::uuid, 'Icon 56 - Penthouse P2', 'condo', 'available', '56 Bach Dang', 'Penthouse P2', 'Ho Chi Minh City', 'Ho Chi Minh', '700000', 'VN', 65000000, 'VND', 3, 3, 150, 'Penthouse with panoramic Saigon River views.', 'High-end expat clientele preferred.', '3BR Penthouse', 'private', 'private', 'standard', 6, 2, 'Penthouse', 'private', 3, 195000000),
    ('aaaaaaaa-0001-4000-8000-000000000020'::uuid, 'Green Valley Townhouse', 'townhouse', 'available', '35 Street 7, Green Valley', 'Unit 7B', 'Ho Chi Minh City', 'Ho Chi Minh', '700000', 'VN', 38000000, 'VND', 4, 3, 175, 'Gated community townhouse in District 7.', 'Near international school. Family tenants preferred.', '4BR Townhouse', 'private', 'private', 'standard', 8, 4, '3 floors', 'private', 2, 76000000)
) as v(
  id,
  name,
  property_type,
  status,
  address_line1,
  address_line2,
  city,
  province,
  postal_code,
  country,
  rent_amount,
  rent_currency,
  bedrooms,
  bathrooms,
  area_sqm,
  description,
  internal_notes,
  room_type,
  toilet_type,
  parking_type,
  main_gate_lock,
  max_occupants,
  max_bikes,
  floor,
  drying_area,
  deposit_months,
  holding_deposit
);

-- ---------------------------------------------------------------------------
-- Property images (3 per property — metadata linked to properties.id)
-- storage_path format: seed/{property_id}/01.jpg
-- ---------------------------------------------------------------------------

insert into public.property_images (property_id, storage_path, sort_order)
select
  p.id,
  'seed/' || p.id::text || '/' || img.slot || '.jpg',
  img.sort_order
from public.properties p
cross join (
  values
    ('01', 0),
    ('02', 1),
    ('03', 2)
) as img(slot, sort_order)
where p.internal_notes like '%SEED:HCMC-20%';

-- ---------------------------------------------------------------------------
-- Utility bills (all 7 bill types per property — March 2026)
-- ---------------------------------------------------------------------------

with seed_user as (
  select id as user_id
  from auth.users
  order by created_at
  limit 1
),
bill_template as (
  select *
  from (
    values
      ('electricity', 1850000, 'EVN HCMC', 'PE12003456', 'March electricity usage'),
      ('water', 420000, 'Saigon Water Corp', 'SW90887766', 'March water bill'),
      ('management', 3200000, 'Building Management', null, 'Monthly building management fee'),
      ('bike_parking', 150000, 'Building Parking', 'BP-SLOT-01', 'Motorbike parking'),
      ('wifi', 299000, 'VNPT Fiber', 'VNPT-882211', '100 Mbps internet package'),
      ('washing_machine', 80000, 'Building Laundry', null, 'Shared laundry card top-up'),
      ('service', 250000, 'Concierge', null, 'Unit cleaning service')
  ) as t(bill_type, amount, provider_name, account_number, notes)
)
insert into public.property_utility_bills (
  property_id,
  bill_type,
  billing_period_start,
  billing_period_end,
  amount,
  currency,
  due_date,
  paid_at,
  status,
  provider_name,
  account_number,
  notes,
  created_by
)
select
  p.id,
  bt.bill_type::public.utility_bill_type,
  '2026-03-01'::date,
  '2026-03-31'::date,
  bt.amount + (p.rent_amount::bigint % 7) * 10000,
  'VND',
  '2026-04-10'::date,
  case
    when p.status = 'rented' and bt.bill_type in ('electricity', 'water', 'management', 'wifi')
      then '2026-04-05 09:30:00+00'::timestamptz
    when p.status = 'available' and bt.bill_type in ('electricity', 'water')
      then '2026-04-06 11:15:00+00'::timestamptz
    else null
  end,
  case
    when p.status = 'rented' and bt.bill_type in ('electricity', 'water', 'management', 'wifi') then 'no_payment_needed'::public.utility_bill_status
    when p.status = 'available' and bt.bill_type in ('electricity', 'water') then 'no_payment_needed'::public.utility_bill_status
    when p.status = 'inactive' then 'waived'::public.utility_bill_status
    else 'needs_payment'::public.utility_bill_status
  end,
  bt.provider_name,
  bt.account_number,
  'SEED:HCMC-20 — ' || bt.notes,
  su.user_id
from public.properties p
cross join bill_template bt
cross join seed_user su
where p.internal_notes like '%SEED:HCMC-20%';

-- ---------------------------------------------------------------------------
-- Verify
-- ---------------------------------------------------------------------------

select
  (select count(*) from public.properties where internal_notes like '%SEED:HCMC-20%') as properties,
  (select count(*) from public.property_images i
   join public.properties p on p.id = i.property_id
   where p.internal_notes like '%SEED:HCMC-20%') as images,
  (select count(*) from public.property_utility_bills b
   join public.properties p on p.id = b.property_id
   where p.internal_notes like '%SEED:HCMC-20%') as utility_bills;
