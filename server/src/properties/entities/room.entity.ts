import { PropertyStatus } from '../enums/property-status.enum';

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
}

export interface RoomImage {
  id: string;
  room_id: string;
  storage_path: string;
  sort_order: number;
  created_at: string;
  public_url?: string;
}

export interface RoomWithImages extends Room {
  images: RoomImage[];
}
