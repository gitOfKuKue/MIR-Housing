import { AmenityFilter } from '../enums/amenity-filter.enum';
import {
  FURNISHING_FILTER_COLUMNS,
  FurnishingFilter,
} from '../enums/furnishing-filter.enum';
import { QueryPropertiesDto } from '../dto/query-properties.dto';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FilterBuilder = any;

export function applyPropertyFilters(
  builder: FilterBuilder,
  query: QueryPropertiesDto,
): FilterBuilder {
  let filtered = builder;

  if (query.status) {
    // List by room availability so a building with mixed rooms still appears;
    // only matching rooms are embedded (via rooms!inner). Detail uses findOne
    // without this filter and returns every room.
    filtered = filtered.eq('rooms.status', query.status);
  }

  if (query.property_type) {
    filtered = filtered.eq('property_type', query.property_type);
  }

  if (query.room_type) {
    filtered = filtered.eq('rooms.room_type', query.room_type);
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
    filtered = filtered.gte('rooms.rent_amount', query.min_rent);
  }

  if (query.max_rent !== undefined) {
    filtered = filtered.lte('rooms.rent_amount', query.max_rent);
  }

  if (query.bedrooms !== undefined) {
    filtered = filtered.eq('rooms.bedrooms', query.bedrooms);
  }

  if (query.bathrooms !== undefined) {
    filtered = filtered.gte('rooms.bathrooms', query.bathrooms);
  }

  if (query.amenities?.length) {
    filtered = applyAmenityFilters(filtered, query.amenities);
  }

  if (query.furnishings?.length) {
    filtered = applyFurnishingFilters(filtered, query.furnishings);
  }

  return filtered;
}

/** Room-scoped filters require an inner join on rooms. */
export function propertySelectNeedsRoomsInner(
  query: QueryPropertiesDto,
): boolean {
  return Boolean(
    query.status ||
      query.furnishings?.length ||
      query.room_type ||
      query.min_rent !== undefined ||
      query.max_rent !== undefined ||
      query.bedrooms !== undefined ||
      query.bathrooms !== undefined,
  );
}

function applyAmenityFilters(
  builder: FilterBuilder,
  amenities: AmenityFilter[],
): FilterBuilder {
  let filtered = builder;
  const selected = new Set(amenities);

  if (selected.has(AmenityFilter.Elevator)) {
    filtered = filtered.eq('has_elevator', true);
  }

  if (selected.has(AmenityFilter.SecurityGuard)) {
    filtered = filtered.eq('has_security_guard', true);
  }

  if (selected.has(AmenityFilter.CarParking)) {
    filtered = filtered.eq('has_car_parking', true);
  }

  if (selected.has(AmenityFilter.MotorbikeParking)) {
    filtered = filtered.eq('has_bike_parking', true);
  }

  if (selected.has(AmenityFilter.EvParking)) {
    filtered = filtered.eq('has_ev_parking', true);
  }

  if (selected.has(AmenityFilter.PetFriendly)) {
    filtered = filtered.eq('pets_ok', true);
  }

  if (selected.has(AmenityFilter.ForeignerFriendly)) {
    filtered = filtered.eq('foreigners_ok', true);
  }

  if (selected.has(AmenityFilter.CleaningService)) {
    filtered = filtered.eq('has_cleaning_service', true);
  }

  return filtered;
}

function applyFurnishingFilters(
  builder: FilterBuilder,
  furnishings: FurnishingFilter[],
): FilterBuilder {
  let filtered = builder;

  for (const item of furnishings) {
    const column = FURNISHING_FILTER_COLUMNS[item];
    filtered = filtered.eq(`rooms.${column}`, true);
  }

  return filtered;
}

function escapeFilterValue(value: string): string {
  return value.replace(/[%_,.()]/g, '\\$&');
}
