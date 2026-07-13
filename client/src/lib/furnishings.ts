export const FURNISHING_VALUES = [
  'air_conditioner',
  'fridge',
  'wardrobe',
  'upper_kitchen_cabinet',
  'lower_kitchen_cabinet',
  'kitchen_counter',
  'mattress',
  'bed',
  'shoe_cabinet',
  'window_outdoor_view',
  'window_corridor',
  'window_air_well',
  'balcony',
  'ventilation_window',
  'dining_table',
  'desk',
  'dressing_table',
  'sofa',
  'tv',
  'range_hood',
  'water_heater',
] as const;

export type FurnishingValue = (typeof FURNISHING_VALUES)[number];

export function isFurnishingValue(value: string): value is FurnishingValue {
  return (FURNISHING_VALUES as readonly string[]).includes(value);
}
