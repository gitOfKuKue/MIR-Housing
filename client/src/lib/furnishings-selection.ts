import type { AmenityValue } from '@/src/lib/amenities';
import type { FurnishingValue } from '@/src/lib/furnishings';
import type { PropertyFurnishings } from '@/src/types/property';

export const FURNISHING_COLUMN_BY_VALUE: Record<
  FurnishingValue,
  keyof PropertyFurnishings
> = {
  air_conditioner: 'has_air_conditioner',
  fridge: 'has_fridge',
  wardrobe: 'has_wardrobe',
  upper_kitchen_cabinet: 'has_upper_kitchen_cabinet',
  lower_kitchen_cabinet: 'has_lower_kitchen_cabinet',
  kitchen_counter: 'has_kitchen_counter',
  mattress: 'has_mattress',
  bed: 'has_bed',
  shoe_cabinet: 'has_shoe_cabinet',
  window_outdoor_view: 'has_window_outdoor_view',
  window_corridor: 'has_window_corridor',
  window_air_well: 'has_window_air_well',
  balcony: 'has_balcony',
  ventilation_window: 'has_ventilation_window',
  dining_table: 'has_dining_table',
  desk: 'has_desk',
  dressing_table: 'has_dressing_table',
  sofa: 'has_sofa',
  tv: 'has_tv',
  range_hood: 'has_range_hood',
  water_heater: 'has_hot_water',
};

export function furnishingsToAmenityValues(
  furnishings: PropertyFurnishings | null | undefined,
): AmenityValue[] {
  if (!furnishings) return [];

  const selected: AmenityValue[] = [];

  if (furnishings.has_elevator) selected.push('elevator');
  if (furnishings.has_security_guard) selected.push('security_guard');
  if (furnishings.has_car_parking) selected.push('car_parking');
  if (furnishings.has_bike_parking) selected.push('motorbike_parking');
  if (furnishings.has_ev_parking) selected.push('ev_parking');
  if (furnishings.pets_ok) selected.push('pet_friendly');
  if (furnishings.foreigners_ok) selected.push('foreigner_friendly');
  if (furnishings.has_solar_hot_water) selected.push('solar_water_heater');
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
  for (const [value, column] of Object.entries(FURNISHING_COLUMN_BY_VALUE)) {
    if (furnishings[column] === true) {
      selected.push(value as FurnishingValue);
    }
  }
  return selected;
}
