export enum AmenityFilter {
  Elevator = 'elevator',
  SharedWashingMachine = 'shared_washing_machine',
  PrivateWashingMachine = 'private_washing_machine',
  SecurityGuard = 'security_guard',
  CarParking = 'car_parking',
  MotorbikeParking = 'motorbike_parking',
  EvParking = 'ev_parking',
  PetFriendly = 'pet_friendly',
  ForeignerFriendly = 'foreigner_friendly',
  SolarWaterHeater = 'solar_water_heater',
  CleaningService = 'cleaning_service',
}

export const AMENITY_FILTER_VALUES = Object.values(AmenityFilter);
