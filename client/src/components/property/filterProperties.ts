import type { AmenityValue } from '@/src/lib/amenities';
import type { FurnishingValue } from '@/src/lib/furnishings';
import type { RoomTypeValue } from '@/src/lib/room-types';
import type { PropertyStatus, PropertyType } from '@/src/types/property';

export type PropertyViewMode = 'card' | 'list';

export interface PropertyFilters {
  search: string;
  status: PropertyStatus | 'all';
  propertyType: PropertyType | 'all';
  roomType: RoomTypeValue | 'all';
  districtCode: number | null;
  district: string;
  ward: string;
  street: string;
  minRent: number;
  maxRent: number;
  includeRented: boolean;
  amenities: AmenityValue[];
  furnishings: FurnishingValue[];
}

export const RENT_FILTER_MIN = 0;
export const RENT_FILTER_MAX_FALLBACK = 20_000_000;
export const RENT_FILTER_STEP = 500_000;

/** Fixed price-range ceiling: 0 – 20,000,000 VND. */
export const RENT_FILTER_MAX = RENT_FILTER_MAX_FALLBACK;

export function resolveRentFilterMax(
  _highestRent?: number | null,
): number {
  return RENT_FILTER_MAX;
}

export function createDefaultPropertyFilters(
  maxRent: number = RENT_FILTER_MAX_FALLBACK,
): PropertyFilters {
  return {
    search: '',
    status: 'all',
    propertyType: 'all',
    roomType: 'all',
    districtCode: null,
    district: '',
    ward: '',
    street: '',
    minRent: RENT_FILTER_MIN,
    maxRent,
    includeRented: false,
    amenities: [],
    furnishings: [],
  };
}

export const DEFAULT_PROPERTY_FILTERS: PropertyFilters =
  createDefaultPropertyFilters();

export interface PropertyQueryParams {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  property_type?: string;
  room_type?: string;
  district?: string;
  ward?: string;
  street?: string;
  city?: string;
  min_rent?: number;
  max_rent?: number;
  amenities?: string;
  furnishings?: string;
}

export function propertyFiltersToQueryParams(
  filters: PropertyFilters,
  page: number,
  limit: number,
  rentFilterMax: number = RENT_FILTER_MAX_FALLBACK,
): PropertyQueryParams {
  const search = filters.search.trim();
  const atMaxRent = filters.maxRent >= rentFilterMax;
  const atMinRent = filters.minRent <= RENT_FILTER_MIN;

  let status: string | undefined;
  if (filters.status !== 'all') {
    status = filters.status;
  } else if (!filters.includeRented) {
    status = 'available';
  }

  return {
    page,
    limit,
    city: 'Ho Chi Minh City',
    ...(search ? { search } : {}),
    ...(status ? { status } : {}),
    ...(filters.propertyType !== 'all'
      ? { property_type: filters.propertyType }
      : {}),
    ...(filters.roomType !== 'all' ? { room_type: filters.roomType } : {}),
    ...(filters.district ? { district: filters.district } : {}),
    ...(filters.ward ? { ward: filters.ward } : {}),
    ...(filters.street ? { street: filters.street } : {}),
    ...(!atMinRent ? { min_rent: filters.minRent } : {}),
    ...(!atMaxRent ? { max_rent: filters.maxRent } : {}),
    ...(filters.amenities.length
      ? { amenities: filters.amenities.join(',') }
      : {}),
    ...(filters.furnishings.length
      ? { furnishings: filters.furnishings.join(',') }
      : {}),
  };
}
