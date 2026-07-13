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
  has_ev_parking: boolean;
  pets_ok: boolean;
  foreigners_ok: boolean;
  has_solar_hot_water: boolean;
  has_cleaning_service: boolean;
  washing_machine: WashingMachineType | null;
  has_air_conditioner: boolean;
  has_fridge: boolean;
  has_wardrobe: boolean;
  has_upper_kitchen_cabinet: boolean;
  has_lower_kitchen_cabinet: boolean;
  has_kitchen_counter: boolean;
  has_mattress: boolean;
  has_bed: boolean;
  has_shoe_cabinet: boolean;
  has_window_outdoor_view: boolean;
  has_window_corridor: boolean;
  has_window_air_well: boolean;
  has_balcony: boolean;
  has_ventilation_window: boolean;
  has_dining_table: boolean;
  has_desk: boolean;
  has_dressing_table: boolean;
  has_sofa: boolean;
  has_tv: boolean;
  has_range_hood: boolean;
  has_hot_water: boolean;
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
    has_security_guard: amenitySet.has(AmenityFilter.SecurityGuard),
    has_car_parking: amenitySet.has(AmenityFilter.CarParking),
    has_bike_parking: amenitySet.has(AmenityFilter.MotorbikeParking),
    has_ev_parking: amenitySet.has(AmenityFilter.EvParking),
    pets_ok: amenitySet.has(AmenityFilter.PetFriendly),
    foreigners_ok: amenitySet.has(AmenityFilter.ForeignerFriendly),
    has_solar_hot_water: amenitySet.has(AmenityFilter.SolarWaterHeater),
    has_cleaning_service: amenitySet.has(AmenityFilter.CleaningService),
    washing_machine: washingMachine,
    has_air_conditioner: false,
    has_fridge: false,
    has_wardrobe: false,
    has_upper_kitchen_cabinet: false,
    has_lower_kitchen_cabinet: false,
    has_kitchen_counter: false,
    has_mattress: false,
    has_bed: false,
    has_shoe_cabinet: false,
    has_window_outdoor_view: false,
    has_window_corridor: false,
    has_window_air_well: false,
    has_balcony: false,
    has_ventilation_window: false,
    has_dining_table: false,
    has_desk: false,
    has_dressing_table: false,
    has_sofa: false,
    has_tv: false,
    has_range_hood: false,
    has_hot_water: false,
  };

  for (const [value, column] of Object.entries(FURNISHING_FILTER_COLUMNS)) {
    row[column as keyof PropertyFurnishingsUpsertRow] = furnishingSet.has(
      value as FurnishingFilter,
    ) as never;
  }

  return row;
}
