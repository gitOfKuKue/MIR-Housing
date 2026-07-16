import { RoomFurnishings } from '../entities/room-furnishings.entity';

export interface UpsertedRoomSummary {
  id: string;
  name: string | null;
}

/** Furnishings view plus rooms in the same order as the request body. */
export interface UpsertPropertyFurnishingsResponse {
  furnishings: RoomFurnishings;
  rooms: UpsertedRoomSummary[];
}
