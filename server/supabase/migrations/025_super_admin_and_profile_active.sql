-- Level 1 Super Administrator + account active flag for deactivation.

alter type public.staff_role add value if not exists 'super_admin';

alter table public.profiles
  add column if not exists is_active boolean not null default true;

alter table public.profiles
  add column if not exists deactivated_at timestamptz;

comment on column public.profiles.is_active is
  'When false, the user cannot sign in (deactivated by a higher-level manager).';

-- Soft-delete: Level 1–3. Drop first because return type must stay timestamptz.
drop function if exists public.soft_delete_property(uuid);

create function public.soft_delete_property(property_id uuid)
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted timestamptz := now();
begin
  if auth.uid() is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role::text in ('super_admin', 'admin', 'sale')
  ) then
    raise exception 'Only super_admin, admin or sale can delete properties'
      using errcode = '42501';
  end if;

  update public.properties
  set
    deleted_at = deleted,
    updated_at = deleted
  where id = property_id
    and deleted_at is null;

  if not found then
    raise exception 'Property not found' using errcode = 'P0002';
  end if;

  return deleted;
end;
$$;

revoke all on function public.soft_delete_property(uuid) from public;
grant execute on function public.soft_delete_property(uuid) to authenticated;
