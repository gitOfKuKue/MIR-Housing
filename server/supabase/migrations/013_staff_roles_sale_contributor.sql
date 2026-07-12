-- Expand staff roles: admin, sale, contributor (migrate legacy staff → sale).

alter type public.staff_role add value if not exists 'sale';
alter type public.staff_role add value if not exists 'contributor';
