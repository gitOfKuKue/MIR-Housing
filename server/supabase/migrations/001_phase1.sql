-- MIR Housing — Phase 1 migration
-- Run in Supabase Dashboard → SQL Editor

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.property_status as enum (
  'available',
  'rented',
  'maintenance',
  'inactive'
);

create type public.property_type as enum (
  'house',
  'condo',
  'apartment',
  'townhouse',
  'other'
);

create type public.staff_role as enum (
  'staff',
  'admin'
);

-- ---------------------------------------------------------------------------
-- profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role public.staff_role not null default 'staff',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles
  for update
  using (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- properties
-- ---------------------------------------------------------------------------

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  property_type public.property_type not null default 'house',
  status public.property_status not null default 'available',
  address_line1 text not null,
  address_line2 text,
  city text not null,
  province text not null,
  postal_code text,
  country text not null default 'TH',
  rent_amount numeric(12, 2),
  rent_currency text not null default 'THB',
  bedrooms integer,
  bathrooms numeric(3, 1),
  area_sqm numeric(10, 2),
  description text,
  internal_notes text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint properties_rent_amount_nonneg
    check (rent_amount is null or rent_amount >= 0),
  constraint properties_bedrooms_nonneg
    check (bedrooms is null or bedrooms >= 0),
  constraint properties_bathrooms_nonneg
    check (bathrooms is null or bathrooms >= 0),
  constraint properties_area_positive
    check (area_sqm is null or area_sqm > 0)
);

create index idx_properties_status on public.properties (status);
create index idx_properties_deleted_at on public.properties (deleted_at);
create index idx_properties_city on public.properties (city);
create index idx_properties_created_at on public.properties (created_at desc);

alter table public.properties enable row level security;

create policy "Authenticated users can read properties"
  on public.properties
  for select
  to authenticated
  using (deleted_at is null);

create policy "Authenticated users can insert properties"
  on public.properties
  for insert
  to authenticated
  with check (true);

-- Edit active properties (cannot set deleted_at via normal patch)
create policy "Authenticated users can update properties"
  on public.properties
  for update
  to authenticated
  using (deleted_at is null)
  with check (deleted_at is null);

-- Soft delete: allow setting deleted_at on active rows only
create policy "Authenticated users can soft delete properties"
  on public.properties
  for update
  to authenticated
  using (deleted_at is null)
  with check (deleted_at is not null);

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

create trigger properties_updated_at
  before update on public.properties
  for each row
  execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
