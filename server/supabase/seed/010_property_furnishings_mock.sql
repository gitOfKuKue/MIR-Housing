-- MIR Housing — mock rooms for seeded HCMC properties
-- Prerequisites: migrations 021 + 023 applied; 009_seed_20_properties_full.sql run
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
  p.id,
  p.name,
  p.room_type,
  p.floor,
  p.area_sqm,
  p.rent_amount,
  coalesce(p.rent_currency, 'VND'),
  p.status,
  p.holding_deposit,
  p.deposit_months,
  p.bedrooms,
  p.bathrooms,
  true, true, true, true, true, true, true, true, true,
  true, false, false, true, false, true, true, false, true, true, true, true
from public.properties p
where p.internal_notes like '%SEED:HCMC-20%';
