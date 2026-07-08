-- MIR Housing — mock utility bills (dev only)
-- Prerequisite: migration 006_property_utility_bills.sql applied
-- Run in Supabase Dashboard → SQL Editor

-- Saigon Pearl Tower - Unit 12A (March 2026 bills)
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
  v.bill_type::public.utility_bill_type,
  v.billing_period_start::date,
  v.billing_period_end::date,
  v.amount,
  'VND',
  v.due_date::date,
  v.paid_at::timestamptz,
  v.status::public.utility_bill_status,
  v.provider_name,
  v.account_number,
  v.notes,
  (select id from auth.users order by created_at limit 1)
from public.properties p
cross join (
  values
    ('electricity', '2026-03-01', '2026-03-31', 1850000, '2026-04-10', '2026-04-05 09:30:00+00', 'paid', 'EVN HCMC', 'PE12003456', 'March electricity usage'),
    ('water', '2026-03-01', '2026-03-31', 420000, '2026-04-10', '2026-04-06 11:15:00+00', 'paid', 'Saigon Water Corp', 'SW90887766', 'March water bill'),
    ('management', '2026-03-01', '2026-03-31', 3200000, '2026-04-05', '2026-04-04 14:00:00+00', 'paid', 'Saigon Pearl Management', null, 'Monthly building management fee'),
    ('bike_parking', '2026-03-01', '2026-03-31', 150000, '2026-04-10', null, 'unpaid', 'Saigon Pearl Parking', 'BP-12A-02', 'Motorbike parking slot B2-45'),
    ('wifi', '2026-03-01', '2026-03-31', 299000, '2026-04-10', '2026-04-07 08:00:00+00', 'paid', 'VNPT Fiber', 'VNPT-882211', '100 Mbps internet package'),
    ('washing_machine', '2026-03-01', '2026-03-31', 80000, '2026-04-10', null, 'unpaid', 'Building Laundry', null, 'Shared laundry card top-up'),
    ('service', '2026-03-01', '2026-03-31', 250000, '2026-04-10', null, 'unpaid', 'Saigon Pearl Concierge', null, 'Unit cleaning service')
) as v(
  bill_type,
  billing_period_start,
  billing_period_end,
  amount,
  due_date,
  paid_at,
  status,
  provider_name,
  account_number,
  notes
)
where p.name = 'Saigon Pearl Tower - Unit 12A'
  and p.deleted_at is null;

-- Vinhomes Central Park - Landmark 6 (February 2026, rented unit)
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
  v.bill_type::public.utility_bill_type,
  v.billing_period_start::date,
  v.billing_period_end::date,
  v.amount,
  'VND',
  v.due_date::date,
  v.paid_at::timestamptz,
  v.status::public.utility_bill_status,
  v.provider_name,
  v.account_number,
  v.notes,
  (select id from auth.users order by created_at limit 1)
from public.properties p
cross join (
  values
    ('electricity', '2026-02-01', '2026-02-28', 2100000, '2026-03-10', '2026-03-08 10:00:00+00', 'paid', 'EVN HCMC', 'PE25058899', 'February electricity'),
    ('water', '2026-02-01', '2026-02-28', 510000, '2026-03-10', '2026-03-09 16:20:00+00', 'paid', 'Saigon Water Corp', 'SW77112233', 'February water'),
    ('management', '2026-02-01', '2026-02-28', 4500000, '2026-03-05', '2026-03-04 09:00:00+00', 'paid', 'Vinhomes Central Park', null, 'February management fee'),
    ('wifi', '2026-02-01', '2026-02-28', 350000, '2026-03-10', '2026-03-07 12:00:00+00', 'paid', 'FPT Telecom', 'FPT-250501', 'Premium wifi package')
) as v(
  bill_type,
  billing_period_start,
  billing_period_end,
  amount,
  due_date,
  paid_at,
  status,
  provider_name,
  account_number,
  notes
)
where p.name = 'Vinhomes Central Park - Landmark 6'
  and p.deleted_at is null;

-- Masteri Thao Dien - Unit 15.08 (March 2026, mix of paid/unpaid)
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
  v.bill_type::public.utility_bill_type,
  v.billing_period_start::date,
  v.billing_period_end::date,
  v.amount,
  'VND',
  v.due_date::date,
  v.paid_at::timestamptz,
  v.status::public.utility_bill_status,
  v.provider_name,
  v.account_number,
  v.notes,
  (select id from auth.users order by created_at limit 1)
from public.properties p
cross join (
  values
    ('electricity', '2026-03-01', '2026-03-31', 1320000, '2026-04-10', null, 'unpaid', 'EVN HCMC', 'PE15087721', 'Awaiting payment'),
    ('water', '2026-03-01', '2026-03-31', 280000, '2026-04-10', '2026-04-02 13:45:00+00', 'paid', 'Saigon Water Corp', 'SW55443322', 'Paid early'),
    ('management', '2026-03-01', '2026-03-31', 2800000, '2026-04-05', null, 'unpaid', 'Masteri Thao Dien', null, 'Q1 management invoice'),
    ('service', '2026-03-01', '2026-03-31', 180000, '2026-04-10', null, 'waived', 'Masteri Thao Dien', null, 'Waived as move-in promotion')
) as v(
  bill_type,
  billing_period_start,
  billing_period_end,
  amount,
  due_date,
  paid_at,
  status,
  provider_name,
  account_number,
  notes
)
where p.name = 'Masteri Thao Dien - Unit 15.08'
  and p.deleted_at is null;

-- Palm Heights Villa (March 2026, higher amounts)
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
  v.bill_type::public.utility_bill_type,
  v.billing_period_start::date,
  v.billing_period_end::date,
  v.amount,
  'VND',
  v.due_date::date,
  v.paid_at::timestamptz,
  v.status::public.utility_bill_status,
  v.provider_name,
  v.account_number,
  v.notes,
  (select id from auth.users order by created_at limit 1)
from public.properties p
cross join (
  values
    ('electricity', '2026-03-01', '2026-03-31', 5200000, '2026-04-10', '2026-04-01 08:30:00+00', 'paid', 'EVN HCMC', 'PE77001234', 'Large villa electricity usage'),
    ('water', '2026-03-01', '2026-03-31', 980000, '2026-04-10', '2026-04-01 08:30:00+00', 'paid', 'Saigon Water Corp', 'SW99001122', 'Garden irrigation included'),
    ('management', '2026-03-01', '2026-03-31', 8500000, '2026-04-05', '2026-04-03 15:00:00+00', 'paid', 'Phu My Hung Management', null, 'Villa estate management'),
    ('bike_parking', '2026-03-01', '2026-03-31', 0, '2026-04-10', null, 'waived', null, null, 'Parking included in lease'),
    ('wifi', '2026-03-01', '2026-03-31', 650000, '2026-04-10', '2026-04-02 09:00:00+00', 'paid', 'Viettel', 'VT-PH0888', 'Business fiber line')
) as v(
  bill_type,
  billing_period_start,
  billing_period_end,
  amount,
  due_date,
  paid_at,
  status,
  provider_name,
  account_number,
  notes
)
where p.name = 'Palm Heights Villa'
  and p.deleted_at is null;

-- Verify inserted rows
select
  p.name as property_name,
  b.bill_type,
  b.billing_period_start,
  b.billing_period_end,
  b.amount,
  b.status
from public.property_utility_bills b
join public.properties p on p.id = b.property_id
order by p.name, b.billing_period_start desc, b.bill_type;
