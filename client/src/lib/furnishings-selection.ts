import type { AmenityValue } from '@/src/lib/amenities';
import type { FurnishingValue } from '@/src/lib/furnishings';
import type { PropertyFurnishings } from '@/src/types/property';

const FURNISHING_COLUMN_TO_VALUE: Record<string, FurnishingValue> = {
  has_bed: 'bed',
  has_mattress: 'mattress',
  has_wardrobe: 'wardrobe',
  has_pillow: 'pillow',
  has_blanket: 'blanket',
  has_tv: 'tv',
  has_fridge: 'fridge',
  has_air_conditioner: 'air_conditioner',
  has_loft: 'loft',
  has_window: 'window',
  has_balcony: 'balcony',
  has_hot_water: 'hot_water',
  has_kitchen_staff: 'kitchen_staff',
  has_skylight: 'skylight',
  has_pool: 'pool',
};

export function furnishingsToAmenityValues(
  furnishings: PropertyFurnishings | null | undefined,
): AmenityValue[] {
  if (!furnishings) return [];

  const selected: AmenityValue[] = [];

  if (furnishings.has_elevator) selected.push('elevator');
  if (furnishings.has_security_guard) selected.push('security_24_7');
  if (furnishings.has_car_parking) selected.push('car_parking');
  if (furnishings.has_bike_parking) selected.push('bike_parking');
  if (furnishings.has_fixed_electricity) selected.push('fixed_electricity');
  if (furnishings.pets_ok) selected.push('pets_ok');
  if (furnishings.foreigners_ok) selected.push('foreigners_ok');
  if (furnishings.has_solar_hot_water) selected.push('solar_hot_water');
  if (furnishings.has_cleaning_service) selected.push('cleaning_service');
  if (furnishings.washing_machine === 'shared') {
    selected.push('shared_washing_machine');
  }
  if (furnishings.washing_machine === 'private') {
    selected.push('private_washing_machine');
  }

  return selected;
}

export function furnishingsToFurnishingValues(
  furnishings: PropertyFurnishings | null | undefined,
): FurnishingValue[] {
  if (!furnishings) return [];

  const selected: FurnishingValue[] = [];
  for (const [column, value] of Object.entries(FURNISHING_COLUMN_TO_VALUE)) {
    if (furnishings[column as keyof PropertyFurnishings] === true) {
      selected.push(value);
    }
  }
  return selected;
}
