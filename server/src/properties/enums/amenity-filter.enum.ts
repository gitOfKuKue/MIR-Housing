export enum AmenityFilter {
  Elevator = 'elevator',
  SharedWashingMachine = 'shared_washing_machine',
  PrivateWashingMachine = 'private_washing_machine',
  Security247 = 'security_24_7',
  CarParking = 'car_parking',
  BikeParking = 'bike_parking',
  FixedElectricity = 'fixed_electricity',
  PetsOk = 'pets_ok',
  ForeignersOk = 'foreigners_ok',
  SolarHotWater = 'solar_hot_water',
  CleaningService = 'cleaning_service',
}

export const AMENITY_FILTER_VALUES = Object.values(AmenityFilter);
