import type { PropertyStatus, PropertyType } from '@/src/types/property';

export type PropertyViewMode = 'card' | 'list';

export type AmenityFilter =
  | 'all'
  | 'has_air_conditioner'
  | 'has_fridge'
  | 'has_balcony'
  | 'has_elevator'
  | 'has_hot_water'
  | 'has_window';

export type FurnishingFilter =
  | 'all'
  | 'has_bed'
  | 'has_mattress'
  | 'has_wardrobe'
  | 'has_tv'
  | 'has_loft';

export interface PropertyFilters {
  search: string;
  status: PropertyStatus | 'all';
  propertyType: PropertyType | 'all';
  districtCode: number | null;
  district: string;
  ward: string;
  street: string;
  minRent: number;
  maxRent: number;
  includeRented: boolean;
  amenity: AmenityFilter;
  furnishing: FurnishingFilter;
}

export const RENT_FILTER_MIN = 0;
export const RENT_FILTER_MAX = 20_000_000;
export const RENT_FILTER_STEP = 500_000;

export const DEFAULT_PROPERTY_FILTERS: PropertyFilters = {
  search: '',
  status: 'all',
  propertyType: 'all',
  districtCode: null,
  district: '',
  ward: '',
  street: '',
  minRent: RENT_FILTER_MIN,
  maxRent: RENT_FILTER_MAX,
  includeRented: false,
  amenity: 'all',
  furnishing: 'all',
};

export interface PropertyQueryParams {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  property_type?: string;
  district?: string;
  ward?: string;
  street?: string;
  city?: string;
  min_rent?: number;
  max_rent?: number;
}

export function propertyFiltersToQueryParams(
  filters: PropertyFilters,
  page: number,
  limit: number,
): PropertyQueryParams {
  const search = filters.search.trim();
  const atMaxRent = filters.maxRent >= RENT_FILTER_MAX;
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
    ...(filters.district ? { district: filters.district } : {}),
    ...(filters.ward ? { ward: filters.ward } : {}),
    ...(filters.street ? { street: filters.street } : {}),
    ...(!atMinRent ? { min_rent: filters.minRent } : {}),
    ...(!atMaxRent ? { max_rent: filters.maxRent } : {}),
  };
}
