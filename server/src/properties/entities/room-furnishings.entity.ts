/**
 * Combined view of building amenities (on `properties`) + room furniture
 * (on `rooms`). Not a database table — assembled in the API mapper.
 */
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
