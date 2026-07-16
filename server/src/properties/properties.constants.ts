export const PROPERTIES_TABLE = 'properties';
export const PROPERTY_IMAGES_TABLE = 'property_images';
export const PROPERTY_UTILITY_BILLS_TABLE = 'property_utility_bills';
export const ROOMS_TABLE = 'rooms';
export const ROOM_IMAGES_TABLE = 'room_images';
export const PROPERTY_IMAGES_BUCKET = 'property-images';

export const PROPERTY_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const PROPERTY_IMAGE_MAX_UPLOAD_COUNT = 10;

export const PROPERTY_IMAGE_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export const PROPERTY_IMAGE_MIME_TO_EXT: Record<
  (typeof PROPERTY_IMAGE_ALLOWED_MIME_TYPES)[number],
  string
> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export const PROPERTY_SELECT_WITH_IMAGES = `
  *,
  images:property_images (
    id,
    property_id,
    storage_path,
    sort_order,
    created_at
  ),
  utility_bills:property_utility_bills (
    id,
    property_id,
    bill_type,
    billing_period_start,
    billing_period_end,
    amount,
    currency,
    due_date,
    paid_at,
    status,
    provider_name,
    account_number,
    notes,
    created_by,
    created_at,
    updated_at
  ),
  rooms:rooms (
    id,
    property_id,
    name,
    room_type,
    floor,
    area_sqm,
    rent_amount,
    rent_currency,
    status,
    holding_deposit,
    deposit_months,
    bedrooms,
    bathrooms,
    has_air_conditioner,
    has_fridge,
    has_wardrobe,
    has_upper_kitchen_cabinet,
    has_lower_kitchen_cabinet,
    has_kitchen_counter,
    has_mattress,
    has_bed,
    has_shoe_cabinet,
    has_window_outdoor_view,
    has_window_corridor,
    has_window_air_well,
    has_balcony,
    has_ventilation_window,
    has_dining_table,
    has_desk,
    has_dressing_table,
    has_sofa,
    has_tv,
    has_range_hood,
    has_hot_water,
    description,
    internal_notes,
    created_by,
    created_at,
    updated_at,
    deleted_at,
    images:room_images (
      id,
      room_id,
      storage_path,
      sort_order,
      created_at
    )
  )
`;
