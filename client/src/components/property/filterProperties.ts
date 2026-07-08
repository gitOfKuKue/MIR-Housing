import type { PropertyFilters } from './PropertyToolbar';

export interface PropertyQueryParams {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  property_type?: string;
}

export function propertyFiltersToQueryParams(
  filters: PropertyFilters,
  page: number,
  limit: number,
): PropertyQueryParams {
  const search = filters.search.trim();

  return {
    page,
    limit,
    ...(search ? { search } : {}),
    ...(filters.status !== 'all' ? { status: filters.status } : {}),
    ...(filters.propertyType !== 'all'
      ? { property_type: filters.propertyType }
      : {}),
  };
}
