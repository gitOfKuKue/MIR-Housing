export type PropertyStatus =
  | 'available'
  | 'rented'
  | 'maintenance'
  | 'inactive';

export type PropertyType =
  | 'house'
  | 'condo'
  | 'apartment'
  | 'townhouse'
  | 'other';

export type FeeWaterType = 'fixed' | 'per_m3';

export type UtilityBillType =
  | 'electricity'
  | 'water'
  | 'bike_parking'
  | 'management'
  | 'wifi'
  | 'washing_machine'
  | 'service';

export type UtilityBillStatus =
  | 'needs_payment'
  | 'no_payment_needed'
  | 'waived';

export interface PropertyUtilityBill {
  id: string;
  property_id: string;
  bill_type: UtilityBillType;
  billing_period_start: string;
  billing_period_end: string;
  amount: number;
  currency: string;
  due_date: string | null;
  paid_at: string | null;
  status: UtilityBillStatus;
  provider_name: string | null;
  account_number: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PropertyImage {
  id: string;
  property_id: string;
  storage_path: string;
  sort_order: number;
  created_at: string;
  public_url: string;
}

export type WashingMachineType = 'private' | 'shared' | 'not_available';

export interface RoomImage {
  id: string;
  room_id: string;
  storage_path: string;
  sort_order: number;
  created_at: string;
  public_url: string;
}

export interface Room {
  id: string;
  property_id: string;
  name: string | null;
  room_type: string | null;
  floor: string | null;
  area_sqm: number | null;
  rent_amount: number | null;
  rent_currency: string;
  status: PropertyStatus;
  holding_deposit: number | null;
  deposit_months: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  has_air_conditioner: boolean | null;
  has_fridge: boolean | null;
  has_wardrobe: boolean | null;
  has_upper_kitchen_cabinet: boolean | null;
  has_lower_kitchen_cabinet: boolean | null;
  has_kitchen_counter: boolean | null;
  has_mattress: boolean | null;
  has_bed: boolean | null;
  has_shoe_cabinet: boolean | null;
  has_window_outdoor_view: boolean | null;
  has_window_corridor: boolean | null;
  has_window_air_well: boolean | null;
  has_balcony: boolean | null;
  has_ventilation_window: boolean | null;
  has_dining_table: boolean | null;
  has_desk: boolean | null;
  has_dressing_table: boolean | null;
  has_sofa: boolean | null;
  has_tv: boolean | null;
  has_range_hood: boolean | null;
  has_hot_water: boolean | null;
  description: string | null;
  internal_notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  images: RoomImage[];
}

/** Combined amenity + furniture view returned by the API for UI compat. */
export interface RoomFurnishings {
  id: string;
  property_id: string;
  has_air_conditioner: boolean | null;
  has_fridge: boolean | null;
  has_wardrobe: boolean | null;
  has_upper_kitchen_cabinet: boolean | null;
  has_lower_kitchen_cabinet: boolean | null;
  has_kitchen_counter: boolean | null;
  has_mattress: boolean | null;
  has_bed: boolean | null;
  has_shoe_cabinet: boolean | null;
  has_window_outdoor_view: boolean | null;
  has_window_corridor: boolean | null;
  has_window_air_well: boolean | null;
  has_balcony: boolean | null;
  has_ventilation_window: boolean | null;
  has_dining_table: boolean | null;
  has_desk: boolean | null;
  has_dressing_table: boolean | null;
  has_sofa: boolean | null;
  has_tv: boolean | null;
  has_range_hood: boolean | null;
  has_hot_water: boolean | null;
  landlord_in_building: boolean | null;
  has_elevator: boolean | null;
  has_security_guard: boolean | null;
  has_car_parking: boolean | null;
  has_bike_parking: boolean | null;
  has_ev_parking: boolean | null;
  pets_ok: boolean | null;
  foreigners_ok: boolean | null;
  has_cleaning_service: boolean | null;
  created_at: string;
  updated_at: string;
}

/** @deprecated Use RoomFurnishings */
export type PropertyFurnishings = RoomFurnishings;

export interface Property {
  id: string;
  name: string;
  property_type: PropertyType;
  status: PropertyStatus;
  address_line1: string;
  address_line2: string | null;
  city: string;
  province: string;
  district: string | null;
  ward: string | null;
  street: string | null;
  postal_code: string | null;
  country: string;
  /** Projected from primary room (not a properties column). */
  rent_amount: number | null;
  rent_currency: string;
  /** Projected from primary room (not a properties column). */
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqm: number | null;
  room_type: string | null;
  floor: string | null;
  deposit_months: number | null;
  holding_deposit: number | null;
  description: string | null;
  internal_notes: string | null;
  zalo_group_link: string | null;
  fee_electricity: string | null;
  fee_water: string | null;
  fee_water_type: FeeWaterType | null;
  fee_motorbike: string | null;
  fee_car: string | null;
  fee_wifi: string | null;
  fee_management: string | null;
  has_elevator: boolean | null;
  has_security_guard: boolean | null;
  has_car_parking: boolean | null;
  has_bike_parking: boolean | null;
  has_ev_parking: boolean | null;
  pets_ok: boolean | null;
  foreigners_ok: boolean | null;
  has_cleaning_service: boolean | null;
  landlord_in_building: boolean | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  images: PropertyImage[];
  utility_bills: PropertyUtilityBill[];
  rooms: Room[];
  furnishings: PropertyFurnishings | null;
}
