/** Ho Chi Minh City province code in provinces.open-api.vn (v1). */
export const HCMC_PROVINCE_CODE = 79;

export const HCMC_CITY_NAME = 'Ho Chi Minh City';
export const HCMC_PROVINCE_NAME = 'Ho Chi Minh';
export const HCMC_COUNTRY_CODE = 'VN';

export const PROVINCES_API_BASE = 'https://provinces.open-api.vn/api/v1';
export const NOMINATIM_API_BASE = 'https://nominatim.openstreetmap.org';
export const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';

export const LOCATION_USER_AGENT =
  'MIR-Housing/1.0 (internal property management; location lookup)';

/** In-memory cache TTLs. */
export const DISTRICTS_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
export const WARDS_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
export const STREETS_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
