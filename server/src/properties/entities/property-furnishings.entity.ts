import { WashingMachineType } from '../enums/washing-machine-type.enum';

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
  created_at: string;
  updated_at: string;
}
