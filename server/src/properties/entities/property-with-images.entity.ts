import { Property } from './property.entity';
import { PropertyImage } from './property-image.entity';
import { PropertyUtilityBill } from './property-utility-bill.entity';
import { Room, RoomImage, RoomWithImages } from './room.entity';
import { RoomFurnishings } from './room-furnishings.entity';

export interface PropertyImageWithUrl extends PropertyImage {
  public_url: string;
}

export interface RoomImageWithUrl extends RoomImage {
  public_url: string;
}

export interface RoomWithImageUrls extends Omit<RoomWithImages, 'images'> {
  images: RoomImageWithUrl[];
}

export interface PropertyWithImages extends Property {
  images: PropertyImageWithUrl[];
  utility_bills: PropertyUtilityBill[];
  rooms: RoomWithImageUrls[];
  /** Combined view: property amenities + primary room furniture (API compat). */
  furnishings: RoomFurnishings | null;
}

interface PropertyRowWithRelations extends Property {
  images?: PropertyImage[] | null;
  property_images?: PropertyImage[] | null;
  utility_bills?: PropertyUtilityBill[] | null;
  property_utility_bills?: PropertyUtilityBill[] | null;
  rooms?: Array<Room & { images?: RoomImage[] | null }> | null;
}

function mapSortedImages<T extends { sort_order: number; created_at: string; storage_path: string }>(
  imageRows: T[],
  getPublicUrl: (storagePath: string) => string,
): Array<T & { public_url: string }> {
  return [...imageRows]
    .sort((a, b) => {
      if (a.sort_order !== b.sort_order) {
        return a.sort_order - b.sort_order;
      }
      return a.created_at.localeCompare(b.created_at);
    })
    .map((image) => ({
      ...image,
      public_url: getPublicUrl(image.storage_path),
    }));
}

function resolvePrimaryRoom(
  rooms: Array<Room & { images?: RoomImage[] | null }>,
): (Room & { images?: RoomImage[] | null }) | null {
  const active = rooms.filter((room) => !room.deleted_at);
  if (active.length === 0) return null;
  return [...active].sort((a, b) =>
    a.created_at.localeCompare(b.created_at),
  )[0];
}

/** Merge building amenities + room furniture into the legacy furnishings shape. */
export function buildFurnishingsView(
  property: Property,
  room: Room | null,
): RoomFurnishings | null {
  if (!room) {
    return {
      id: property.id,
      property_id: property.id,
      has_air_conditioner: null,
      has_fridge: null,
      has_wardrobe: null,
      has_upper_kitchen_cabinet: null,
      has_lower_kitchen_cabinet: null,
      has_kitchen_counter: null,
      has_mattress: null,
      has_bed: null,
      has_shoe_cabinet: null,
      has_window_outdoor_view: null,
      has_window_corridor: null,
      has_window_air_well: null,
      has_balcony: null,
      has_ventilation_window: null,
      has_dining_table: null,
      has_desk: null,
      has_dressing_table: null,
      has_sofa: null,
      has_tv: null,
      has_range_hood: null,
      has_hot_water: null,
      washing_machine: property.washing_machine,
      landlord_in_building: property.landlord_in_building,
      has_elevator: property.has_elevator,
      has_security_guard: property.has_security_guard,
      has_car_parking: property.has_car_parking,
      has_bike_parking: property.has_bike_parking,
      has_ev_parking: property.has_ev_parking,
      pets_ok: property.pets_ok,
      foreigners_ok: property.foreigners_ok,
      has_solar_hot_water: property.has_solar_hot_water,
      has_cleaning_service: property.has_cleaning_service,
      created_at: property.created_at,
      updated_at: property.updated_at,
    };
  }

  return {
    id: room.id,
    property_id: property.id,
    has_air_conditioner: room.has_air_conditioner,
    has_fridge: room.has_fridge,
    has_wardrobe: room.has_wardrobe,
    has_upper_kitchen_cabinet: room.has_upper_kitchen_cabinet,
    has_lower_kitchen_cabinet: room.has_lower_kitchen_cabinet,
    has_kitchen_counter: room.has_kitchen_counter,
    has_mattress: room.has_mattress,
    has_bed: room.has_bed,
    has_shoe_cabinet: room.has_shoe_cabinet,
    has_window_outdoor_view: room.has_window_outdoor_view,
    has_window_corridor: room.has_window_corridor,
    has_window_air_well: room.has_window_air_well,
    has_balcony: room.has_balcony,
    has_ventilation_window: room.has_ventilation_window,
    has_dining_table: room.has_dining_table,
    has_desk: room.has_desk,
    has_dressing_table: room.has_dressing_table,
    has_sofa: room.has_sofa,
    has_tv: room.has_tv,
    has_range_hood: room.has_range_hood,
    has_hot_water: room.has_hot_water,
    washing_machine: property.washing_machine,
    landlord_in_building: property.landlord_in_building,
    has_elevator: property.has_elevator,
    has_security_guard: property.has_security_guard,
    has_car_parking: property.has_car_parking,
    has_bike_parking: property.has_bike_parking,
    has_ev_parking: property.has_ev_parking,
    pets_ok: property.pets_ok,
    foreigners_ok: property.foreigners_ok,
    has_solar_hot_water: property.has_solar_hot_water,
    has_cleaning_service: property.has_cleaning_service,
    created_at: room.created_at,
    updated_at: room.updated_at,
  };
}

export function mapPropertyWithImages(
  row: PropertyRowWithRelations,
  getPublicUrl: (storagePath: string) => string,
): PropertyWithImages {
  const imageRows = row.images ?? row.property_images ?? [];
  const utilityBillRows =
    row.utility_bills ?? row.property_utility_bills ?? [];
  const roomRows = row.rooms ?? [];

  const {
    images: _images,
    property_images: _propertyImages,
    utility_bills: _utilityBills,
    property_utility_bills: _propertyUtilityBills,
    rooms: _rooms,
    ...property
  } = row;

  const rooms: RoomWithImageUrls[] = roomRows
    .filter((room) => !room.deleted_at)
    .map((room) => {
      const { images: roomImages, ...roomFields } = room;
      return {
        ...roomFields,
        images: mapSortedImages(roomImages ?? [], getPublicUrl),
      };
    })
    .sort((a, b) => a.created_at.localeCompare(b.created_at));

  const primaryRoom = resolvePrimaryRoom(roomRows);

  return {
    ...property,
    images: mapSortedImages(imageRows, getPublicUrl),
    utility_bills: [...utilityBillRows].sort((a, b) => {
      const periodCompare = b.billing_period_start.localeCompare(
        a.billing_period_start,
      );
      if (periodCompare !== 0) return periodCompare;
      return a.bill_type.localeCompare(b.bill_type);
    }),
    rooms,
    furnishings: buildFurnishingsView(property, primaryRoom),
  };
}
