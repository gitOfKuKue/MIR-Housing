export const AMENITY_VALUES = [
  'elevator',
  'security_guard',
  'car_parking',
  'motorbike_parking',
  'ev_parking',
  'pet_friendly',
  'foreigner_friendly',
  'cleaning_service',
] as const;

export type AmenityValue = (typeof AMENITY_VALUES)[number];

export function isAmenityValue(value: string): value is AmenityValue {
  return (AMENITY_VALUES as readonly string[]).includes(value);
}
