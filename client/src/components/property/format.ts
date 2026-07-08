import type { Property } from '@/src/types/property';

export function formatPropertyType(type: Property['property_type']): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export function formatStatus(status: Property['status']): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function formatRent(
  amount: number | null,
  currency: string,
): string | null {
  if (amount === null) return null;

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

export function formatAddress(property: Property): string {
  const parts = [
    property.address_line1,
    property.address_line2,
    property.city,
    property.province,
    property.postal_code,
    property.country,
  ].filter(Boolean);

  return parts.join(', ');
}

export function statusStyles(status: Property['status']): string {
  switch (status) {
    case 'available':
      return 'bg-[#e8f3ed] text-[#1e4636]';
    case 'rented':
      return 'bg-[#dbeafe] text-[#1d4ed8]';
    case 'maintenance':
      return 'bg-[#fef3c7] text-[#b45309]';
    case 'inactive':
      return 'bg-[#f3f4f6] text-[#6b7280]';
    default:
      return 'bg-[#f3f4f6] text-[#6b7280]';
  }
}

const UTILITY_BILL_TYPE_LABELS: Record<Property['utility_bills'][number]['bill_type'], string> = {
  electricity: 'Electricity',
  water: 'Water',
  bike_parking: 'Bike parking',
  management: 'Management',
  wifi: 'Wifi',
  washing_machine: 'Washing machine',
  service: 'Service',
};

export function formatBillType(
  billType: Property['utility_bills'][number]['bill_type'],
): string {
  return UTILITY_BILL_TYPE_LABELS[billType];
}

const UTILITY_BILL_STATUS_LABELS: Record<
  Property['utility_bills'][number]['status'],
  string
> = {
  needs_payment: 'Needs payment',
  no_payment_needed: 'No payment needed',
  waived: 'Waived',
};

export function formatBillStatus(
  status: Property['utility_bills'][number]['status'],
): string {
  return UTILITY_BILL_STATUS_LABELS[status];
}

export function utilityBillStatusStyles(
  status: Property['utility_bills'][number]['status'],
): string {
  switch (status) {
    case 'no_payment_needed':
      return 'bg-[#e8f3ed] text-[#1e4636]';
    case 'needs_payment':
      return 'bg-[#fee2e2] text-[#b91c1c]';
    case 'waived':
      return 'bg-[#f3f4f6] text-[#6b7280]';
    default:
      return 'bg-[#f3f4f6] text-[#6b7280]';
  }
}

export function formatBillingPeriod(start: string, end: string): string {
  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return `${formatter.format(new Date(start))} – ${formatter.format(new Date(end))}`;
}

export function formatPrivateShared(
  value: 'private' | 'shared' | null | undefined,
): string | null {
  if (!value) return null;
  return value === 'private' ? 'Private' : 'Shared';
}

export function formatMainGateLock(
  value: 'standard' | 'none' | null | undefined,
): string | null {
  if (!value) return null;
  return value === 'standard' ? 'Standard' : 'None';
}

export function formatDepositMonths(months: number | null | undefined): string | null {
  if (months === null || months === undefined) return null;
  return months === 1 ? '1 month' : `${months} months`;
}
