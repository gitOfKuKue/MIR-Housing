import { AmenityFilter } from '../enums/amenity-filter.enum';
import {
  FURNISHING_FILTER_COLUMNS,
  FurnishingFilter,
} from '../enums/furnishing-filter.enum';
import { WashingMachineType } from '../enums/washing-machine-type.enum';

export type PropertyFurnishingsUpsertRow = {
  property_id: string;
  has_elevator: boolean;
  has_security_guard: boolean;
  has_car_parking: boolean;
  has_bike_parking: boolean;
  has_fixed_electricity: boolean;
  pets_ok: boolean;
  foreigners_ok: boolean;
  has_solar_hot_water: boolean;
  has_cleaning_service: boolean;
  washing_machine: WashingMachineType | null;
  has_bed: boolean;
  has_mattress: boolean;
  has_wardrobe: boolean;
  has_pillow: boolean;
  has_blanket: boolean;
  has_tv: boolean;
  has_fridge: boolean;
  has_air_conditioner: boolean;
  has_loft: boolean;
  has_window: boolean;
  has_balcony: boolean;
  has_hot_water: boolean;
  has_kitchen_staff: boolean;
  has_skylight: boolean;
  has_pool: boolean;
};

export function buildFurnishingsUpsertRow(
  propertyId: string,
  amenities: AmenityFilter[] = [],
  furnishings: FurnishingFilter[] = [],
): PropertyFurnishingsUpsertRow {
  const amenitySet = new Set(amenities);
  const furnishingSet = new Set(furnishings);

  let washingMachine: WashingMachineType | null = null;
  if (amenitySet.has(AmenityFilter.PrivateWashingMachine)) {
    washingMachine = WashingMachineType.Private;
  } else if (amenitySet.has(AmenityFilter.SharedWashingMachine)) {
    washingMachine = WashingMachineType.Shared;
  }

  const row: PropertyFurnishingsUpsertRow = {
    property_id: propertyId,
    has_elevator: amenitySet.has(AmenityFilter.Elevator),
    has_security_guard: amenitySet.has(AmenityFilter.Security247),
    has_car_parking: amenitySet.has(AmenityFilter.CarParking),
    has_bike_parking: amenitySet.has(AmenityFilter.BikeParking),
    has_fixed_electricity: amenitySet.has(AmenityFilter.FixedElectricity),
    pets_ok: amenitySet.has(AmenityFilter.PetsOk),
    foreigners_ok: amenitySet.has(AmenityFilter.ForeignersOk),
    has_solar_hot_water: amenitySet.has(AmenityFilter.SolarHotWater),
    has_cleaning_service: amenitySet.has(AmenityFilter.CleaningService),
    washing_machine: washingMachine,
    has_bed: false,
    has_mattress: false,
    has_wardrobe: false,
    has_pillow: false,
    has_blanket: false,
    has_tv: false,
    has_fridge: false,
    has_air_conditioner: false,
    has_loft: false,
    has_window: false,
    has_balcony: false,
    has_hot_water: false,
    has_kitchen_staff: false,
    has_skylight: false,
    has_pool: false,
  };

  for (const [value, column] of Object.entries(FURNISHING_FILTER_COLUMNS)) {
    row[column as keyof PropertyFurnishingsUpsertRow] = furnishingSet.has(
      value as FurnishingFilter,
    ) as never;
  }

  return row;
}
