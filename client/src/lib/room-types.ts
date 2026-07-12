export const ROOM_TYPE_VALUES = [
  'studio',
  'duplex',
  '1_bedroom',
  '2_bedroom',
  'private_kitchen',
  'commercial_space',
  'ground_plus_one',
  'kiosk',
  'sleepbox',
  'dormitory',
  'foreigner_apartment',
  'mini_apartment',
] as const;

export type RoomTypeValue = (typeof ROOM_TYPE_VALUES)[number];

export function isRoomTypeValue(value: string): value is RoomTypeValue {
  return (ROOM_TYPE_VALUES as readonly string[]).includes(value);
}
