export const AMENITY_VALUES = [
  'elevator',
  'shared_washing_machine',
  'private_washing_machine',
  'security_24_7',
  'car_parking',
  'bike_parking',
  'fixed_electricity',
  'pets_ok',
  'foreigners_ok',
  'solar_hot_water',
  'cleaning_service',
] as const;

export type AmenityValue = (typeof AMENITY_VALUES)[number];

export function isAmenityValue(value: string): value is AmenityValue {
  return (AMENITY_VALUES as readonly string[]).includes(value);
}
