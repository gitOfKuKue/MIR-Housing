-- MIR Housing — Zalo group link on properties
-- Run in Supabase Dashboard → SQL Editor

alter table public.properties
  add column if not exists zalo_group_link text;
