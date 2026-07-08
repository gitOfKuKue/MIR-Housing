-- MIR Housing — property utility bills
-- Run in Supabase Dashboard → SQL Editor

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.utility_bill_type as enum (
  'electricity',
  'water',
  'bike_parking',
  'management',
  'wifi',
  'washing_machine',
  'service'
);

create type public.utility_bill_status as enum (
  'unpaid',
  'paid',
  'waived'
);

-- ---------------------------------------------------------------------------
-- property_utility_bills
-- ---------------------------------------------------------------------------

create table if not exists public.property_utility_bills (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  bill_type public.utility_bill_type not null,
  billing_period_start date not null,
  billing_period_end date not null,
  amount numeric(12, 2) not null,
  currency text not null default 'VND',
  due_date date,
  paid_at timestamptz,
  status public.utility_bill_status not null default 'unpaid',
  provider_name text,
  account_number text,
  notes text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint property_utility_bills_amount_nonneg
    check (amount >= 0),
  constraint property_utility_bills_period_valid
    check (billing_period_end >= billing_period_start)
);

create index if not exists idx_property_utility_bills_property_id
  on public.property_utility_bills (property_id);

create index if not exists idx_property_utility_bills_bill_type
  on public.property_utility_bills (bill_type);

create index if not exists idx_property_utility_bills_period
  on public.property_utility_bills (billing_period_start, billing_period_end);

create index if not exists idx_property_utility_bills_status
  on public.property_utility_bills (status);

alter table public.property_utility_bills enable row level security;

create policy "Authenticated users can read property utility bills"
  on public.property_utility_bills
  for select
  to authenticated
  using (true);

create policy "Authenticated users can insert property utility bills"
  on public.property_utility_bills
  for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update property utility bills"
  on public.property_utility_bills
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can delete property utility bills"
  on public.property_utility_bills
  for delete
  to authenticated
  using (true);

create trigger property_utility_bills_updated_at
  before update on public.property_utility_bills
  for each row
  execute function public.set_updated_at();
