-- Structured HCMC location fields for District → Ward → Street filtering.
alter table public.properties
  add column if not exists district text,
  add column if not exists ward text,
  add column if not exists street text;

create index if not exists idx_properties_district on public.properties (district);
create index if not exists idx_properties_ward on public.properties (ward);
create index if not exists idx_properties_street on public.properties (street);
