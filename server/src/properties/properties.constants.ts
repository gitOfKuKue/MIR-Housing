export const PROPERTIES_TABLE = 'properties';
export const PROPERTY_IMAGES_TABLE = 'property_images';
export const PROPERTY_UTILITY_BILLS_TABLE = 'property_utility_bills';
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
  furnishings:property_furnishings (*)
`;
