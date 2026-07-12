-- Apply after 013 (new enum values must be committed before use in some PG versions).

update public.profiles
set role = 'sale'
where role::text = 'staff';

alter table public.profiles
  alter column role set default 'contributor';

create or replace function public.soft_delete_property(property_id uuid)
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
      and role in ('admin', 'sale')
  ) then
    raise exception 'Only admin or sale can delete properties' using errcode = '42501';
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
