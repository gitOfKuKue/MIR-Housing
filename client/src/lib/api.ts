import { getAccessToken, handleSessionExpired, isSessionExpired } from './auth';
import type { Property, PropertyFurnishings } from '@/src/types/property';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000/api/v1';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: {
    id: string;
    email: string;
    full_name: string | null;
    role: 'admin' | 'sale' | 'contributor';
  };
}

interface ApiErrorBody {
  message?: string | string[];
  error?: string;
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as ApiErrorBody;
    if (Array.isArray(data.message)) {
      return data.message.join(', ');
    }
    return data.message ?? data.error ?? 'Request failed';
  } catch {
    return response.statusText || 'Request failed';
  }
}

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password }),
    });
  } catch {
    throw new Error(
      'Cannot reach the server. Make sure the API is running on port 8000.',
    );
  }

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as LoginResponse;
}

export async function getMe() {
  return apiFetch<{ user: LoginResponse['user'] }>('/auth/me');
}

export async function logout() {
  return apiFetch<{ message: string }>('/auth/logout', { method: 'POST' });
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export async function changePassword(
  payload: ChangePasswordPayload,
): Promise<ChangePasswordResponse> {
  return apiFetch<ChangePasswordResponse>('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export interface CreateUserPayload {
  email: string;
  password: string;
  full_name?: string;
  role?: 'admin' | 'sale' | 'contributor';
}

export interface CreateUserResponse {
  message: string;
  user: LoginResponse['user'];
}

export async function createUser(
  payload: CreateUserPayload,
): Promise<CreateUserResponse> {
  return apiFetch<CreateUserResponse>('/auth/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getProperties(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  property_type?: string;
  room_type?: string;
  district?: string;
  ward?: string;
  street?: string;
  city?: string;
  min_rent?: number;
  max_rent?: number;
  amenities?: string;
  furnishings?: string;
}): Promise<PaginatedResponse<Property>> {
  const searchParams = new URLSearchParams();

  if (params?.page) {
    searchParams.set('page', String(params.page));
  }

  if (params?.limit) {
    searchParams.set('limit', String(params.limit));
  }

  if (params?.search) {
    searchParams.set('search', params.search);
  }

  if (params?.status) {
    searchParams.set('status', params.status);
  }

  if (params?.property_type) {
    searchParams.set('property_type', params.property_type);
  }

  if (params?.room_type) {
    searchParams.set('room_type', params.room_type);
  }

  if (params?.district) {
    searchParams.set('district', params.district);
  }

  if (params?.ward) {
    searchParams.set('ward', params.ward);
  }

  if (params?.street) {
    searchParams.set('street', params.street);
  }

  if (params?.city) {
    searchParams.set('city', params.city);
  }

  if (params?.min_rent !== undefined) {
    searchParams.set('min_rent', String(params.min_rent));
  }

  if (params?.max_rent !== undefined) {
    searchParams.set('max_rent', String(params.max_rent));
  }

  if (params?.amenities) {
    searchParams.set('amenities', params.amenities);
  }

  if (params?.furnishings) {
    searchParams.set('furnishings', params.furnishings);
  }

  const query = searchParams.toString();

  return apiFetch<PaginatedResponse<Property>>(
    `/properties${query ? `?${query}` : ''}`,
  );
}

export async function getPropertyRentBounds(): Promise<{
  max_rent: number | null;
}> {
  return apiFetch<{ max_rent: number | null }>('/properties/rent-bounds');
}

export async function getAllProperties(): Promise<Property[]> {
  const firstPage = await getProperties({ page: 1, limit: 100 });

  if (firstPage.meta.totalPages <= 1) {
    return firstPage.data;
  }

  const remainingPages = await Promise.all(
    Array.from({ length: firstPage.meta.totalPages - 1 }, (_, index) =>
      getProperties({ page: index + 2, limit: 100 }),
    ),
  );

  return [
    ...firstPage.data,
    ...remainingPages.flatMap((page) => page.data),
  ];
}

export async function getProperty(id: string): Promise<Property> {
  return apiFetch<Property>(`/properties/${id}`);
}

export type CreatePropertyPayload = {
  name: string;
  address_line1: string;
  city: string;
  province: string;
  property_type?: Property['property_type'];
  status?: Property['status'];
  address_line2?: string;
  district?: string;
  ward?: string;
  street?: string;
  postal_code?: string;
  country?: string;
  rent_amount?: number;
  rent_currency?: string;
  bedrooms?: number;
  bathrooms?: number;
  area_sqm?: number;
  room_type?: string;
  floor?: string;
  deposit_months?: number;
  holding_deposit?: number;
  description?: string;
  internal_notes?: string;
  zalo_group_link?: string;
  fee_electricity?: string;
  fee_water?: string;
  fee_water_type?: Property['fee_water_type'];
  fee_motorbike?: string;
  fee_car?: string;
  fee_wifi?: string;
  fee_management?: string;
};

export interface LocationOption {
  code?: number;
  name: string;
}

export interface LocationScope {
  city: string;
  province: string;
  country: string;
  province_code: number;
}

export async function getLocationScope(): Promise<LocationScope> {
  return apiFetch<LocationScope>('/locations/scope');
}

export async function getDistricts(): Promise<LocationOption[]> {
  return apiFetch<LocationOption[]>('/locations/districts');
}

export async function getWards(districtCode: number): Promise<LocationOption[]> {
  return apiFetch<LocationOption[]>(
    `/locations/wards?district_code=${districtCode}`,
  );
}

export async function getStreets(params: {
  district: string;
  ward: string;
  search?: string;
}): Promise<LocationOption[]> {
  const searchParams = new URLSearchParams({
    district: params.district,
    ward: params.ward,
  });

  if (params.search?.trim()) {
    searchParams.set('search', params.search.trim());
  }

  return apiFetch<LocationOption[]>(`/locations/streets?${searchParams}`);
}

export async function createProperty(
  payload: CreatePropertyPayload,
): Promise<Property> {
  return apiFetch<Property>('/properties', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export type UpdatePropertyPayload = Partial<{
  [K in keyof CreatePropertyPayload]: CreatePropertyPayload[K] | null;
}>;

export async function updateProperty(
  id: string,
  payload: UpdatePropertyPayload,
): Promise<Property> {
  return apiFetch<Property>(`/properties/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function upsertPropertyFurnishings(
  propertyId: string,
  payload: {
    amenities?: string[];
    furnishings?: string[];
  },
): Promise<PropertyFurnishings> {
  return apiFetch<PropertyFurnishings>(`/properties/${propertyId}/furnishings`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export interface DeletePropertyResponse {
  id: string;
  deleted_at: string;
  message: string;
}

export async function deleteProperty(
  id: string,
): Promise<DeletePropertyResponse> {
  return apiFetch<DeletePropertyResponse>(`/properties/${id}`, {
    method: 'DELETE',
  });
}

export interface UploadPropertyImagesResponse {
  data: Property['images'];
  meta: { uploaded: number };
}

export async function uploadPropertyImages(
  propertyId: string,
  files: File[],
  sortOrder = 0,
): Promise<UploadPropertyImagesResponse> {
  if (files.length === 0) {
    return { data: [], meta: { uploaded: 0 } };
  }

  const formData = new FormData();
  files.forEach((file) => {
    formData.append('file', file);
  });
  formData.append('sort_order', String(sortOrder));

  const token = getAccessToken();

  if (isSessionExpired()) {
    handleSessionExpired();
    throw new Error('Session expired. Please sign in again.');
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/properties/${propertyId}/images`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });
  } catch {
    throw new Error(
      'Cannot reach the server. Make sure the API is running on port 8000.',
    );
  }

  if (!response.ok) {
    await handleUnauthorized(response, Boolean(token));
  }

  return (await response.json()) as UploadPropertyImagesResponse;
}

async function handleUnauthorized(response: Response, hadToken: boolean): Promise<never> {
  if (response.status === 401 && hadToken) {
    handleSessionExpired();
    throw new Error('Session expired. Please sign in again.');
  }

  throw new Error(await parseErrorMessage(response));
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  if (isSessionExpired()) {
    handleSessionExpired();
    throw new Error('Session expired. Please sign in again.');
  }

  const token = getAccessToken();

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error(
      'Cannot reach the server. Make sure the API is running on port 8000.',
    );
  }

  if (!response.ok) {
    await handleUnauthorized(response, Boolean(token));
  }

  return (await response.json()) as T;
}
