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
    filtered = filtered.eq('status', query.status);
  }

  if (query.property_type) {
    filtered = filtered.eq('property_type', query.property_type);
  }

  if (query.room_type) {
    filtered = filtered.eq('room_type', query.room_type);
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

  if (query.amenities?.length) {
    filtered = applyAmenityFilters(filtered, query.amenities);
  }

  if (query.furnishings?.length) {
    filtered = applyFurnishingFilters(filtered, query.furnishings);
  }

  return filtered;
}

export function propertySelectNeedsFurnishingsInner(
  query: QueryPropertiesDto,
): boolean {
  return Boolean(query.amenities?.length || query.furnishings?.length);
}

function applyAmenityFilters(
  builder: FilterBuilder,
  amenities: AmenityFilter[],
): FilterBuilder {
  let filtered = builder;
  const selected = new Set(amenities);

  if (selected.has(AmenityFilter.Elevator)) {
    filtered = filtered.eq('furnishings.has_elevator', true);
  }

  if (selected.has(AmenityFilter.Security247)) {
    filtered = filtered.eq('furnishings.has_security_guard', true);
  }

  if (selected.has(AmenityFilter.CarParking)) {
    filtered = filtered.eq('furnishings.has_car_parking', true);
  }

  if (selected.has(AmenityFilter.BikeParking)) {
    filtered = filtered.eq('furnishings.has_bike_parking', true);
  }

  if (selected.has(AmenityFilter.FixedElectricity)) {
    filtered = filtered.eq('furnishings.has_fixed_electricity', true);
  }

  if (selected.has(AmenityFilter.PetsOk)) {
    filtered = filtered.eq('furnishings.pets_ok', true);
  }

  if (selected.has(AmenityFilter.ForeignersOk)) {
    filtered = filtered.eq('furnishings.foreigners_ok', true);
  }

  if (selected.has(AmenityFilter.SolarHotWater)) {
    filtered = filtered.eq('furnishings.has_solar_hot_water', true);
  }

  if (selected.has(AmenityFilter.CleaningService)) {
    filtered = filtered.eq('furnishings.has_cleaning_service', true);
  }

  const wantsShared = selected.has(AmenityFilter.SharedWashingMachine);
  const wantsPrivate = selected.has(AmenityFilter.PrivateWashingMachine);

  if (wantsShared && wantsPrivate) {
    filtered = filtered.in('furnishings.washing_machine', [
      'shared',
      'private',
    ]);
  } else if (wantsShared) {
    filtered = filtered.eq('furnishings.washing_machine', 'shared');
  } else if (wantsPrivate) {
    filtered = filtered.eq('furnishings.washing_machine', 'private');
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
    filtered = filtered.eq(`furnishings.${column}`, true);
  }

  return filtered;
}

function escapeFilterValue(value: string): string {
  return value.replace(/[%_,.()]/g, '\\$&');
}
