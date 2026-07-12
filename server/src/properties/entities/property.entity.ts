import { PropertyStatus } from '../enums/property-status.enum';
import { PropertyType } from '../enums/property-type.enum';
import {
  DryingAreaType,
  MainGateLockType,
  ParkingType,
  ToiletType,
} from '../enums/room-amenity.enum';

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
}
