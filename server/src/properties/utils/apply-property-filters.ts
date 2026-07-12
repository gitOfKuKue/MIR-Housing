import { QueryPropertiesDto } from '../dto/query-properties.dto';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FilterBuilder = any;

export function applyPropertyFilters(
  builder: FilterBuilder,
  query: QueryPropertiesDto,
): FilterBuilder {
  let filtered = builder;

  if (query.status) {
    filtered = filtered.eq('status', query.status);
  }

  if (query.property_type) {
    filtered = filtered.eq('property_type', query.property_type);
  }

  if (query.city) {
    filtered = filtered.ilike('city', `%${escapeFilterValue(query.city)}%`);
  }

  if (query.province) {
    filtered = filtered.ilike(
      'province',
      `%${escapeFilterValue(query.province)}%`,
    );
  }

  if (query.district) {
    filtered = filtered.ilike(
      'district',
      `%${escapeFilterValue(query.district)}%`,
    );
  }

  if (query.ward) {
    filtered = filtered.ilike('ward', `%${escapeFilterValue(query.ward)}%`);
  }

  if (query.street) {
    filtered = filtered.ilike(
      'street',
      `%${escapeFilterValue(query.street)}%`,
    );
  }

  if (query.country) {
    filtered = filtered.eq('country', query.country);
  }

  if (query.search) {
    const term = escapeFilterValue(query.search);
    filtered = filtered.or(
      `name.ilike.%${term}%,address_line1.ilike.%${term}%,street.ilike.%${term}%,district.ilike.%${term}%,ward.ilike.%${term}%,city.ilike.%${term}%,description.ilike.%${term}%`,
    );
  }

  if (query.min_rent !== undefined) {
    filtered = filtered.gte('rent_amount', query.min_rent);
  }

  if (query.max_rent !== undefined) {
    filtered = filtered.lte('rent_amount', query.max_rent);
  }

  if (query.bedrooms !== undefined) {
    filtered = filtered.eq('bedrooms', query.bedrooms);
  }

  if (query.bathrooms !== undefined) {
    filtered = filtered.gte('bathrooms', query.bathrooms);
  }

  return filtered;
}

function escapeFilterValue(value: string): string {
  return value.replace(/[%_,.()]/g, '\\$&');
}
