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

export type ToiletType = 'private' | 'shared';
export type ParkingType = 'private' | 'shared';
export type MainGateLockType = 'standard' | 'none';
export type DryingAreaType = 'private' | 'shared';

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

export interface PropertyFurnishings {
  id: string;
  property_id: string;
  has_loft: boolean | null;
  has_window: boolean | null;
  has_balcony: boolean | null;
  has_fridge: boolean | null;
  has_tv: boolean | null;
  has_air_conditioner: boolean | null;
  washing_machine: WashingMachineType | null;
  has_kitchen_staff: boolean | null;
  has_hot_water: boolean | null;
  has_bed: boolean | null;
  has_mattress: boolean | null;
  has_wardrobe: boolean | null;
  has_pillow: boolean | null;
  has_blanket: boolean | null;
  landlord_in_building: boolean | null;
  has_elevator: boolean | null;
  has_security_guard: boolean | null;
  has_skylight: boolean | null;
  has_pool: boolean | null;
  has_car_parking: boolean | null;
  has_bike_parking: boolean | null;
  has_fixed_electricity: boolean | null;
  pets_ok: boolean | null;
  foreigners_ok: boolean | null;
  has_solar_hot_water: boolean | null;
  has_cleaning_service: boolean | null;
  created_at: string;
  updated_at: string;
}

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
  rent_amount: number | null;
  rent_currency: string;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqm: number | null;
  room_type: string | null;
  toilet_type: ToiletType | null;
  parking_type: ParkingType | null;
  main_gate_lock: MainGateLockType | null;
  max_occupants: number | null;
  max_bikes: number | null;
  floor: string | null;
  drying_area: DryingAreaType | null;
  deposit_months: number | null;
  holding_deposit: number | null;
  description: string | null;
  internal_notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  images: PropertyImage[];
  utility_bills: PropertyUtilityBill[];
  furnishings: PropertyFurnishings | null;
}
