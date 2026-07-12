export const FURNISHING_VALUES = [
  'bed',
  'mattress',
  'wardrobe',
  'pillow',
  'blanket',
  'tv',
  'fridge',
  'air_conditioner',
  'loft',
  'window',
  'balcony',
  'hot_water',
  'kitchen_staff',
  'skylight',
  'pool',
] as const;

export type FurnishingValue = (typeof FURNISHING_VALUES)[number];

export function isFurnishingValue(value: string): value is FurnishingValue {
  return (FURNISHING_VALUES as readonly string[]).includes(value);
}
