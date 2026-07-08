-- MIR Housing — rename utility bill status values
-- unpaid  → needs_payment
-- paid    → no_payment_needed
-- waived  → waived (unchanged)

alter type public.utility_bill_status rename value 'unpaid' to 'needs_payment';
alter type public.utility_bill_status rename value 'paid' to 'no_payment_needed';

alter table public.property_utility_bills
  alter column status set default 'needs_payment';
