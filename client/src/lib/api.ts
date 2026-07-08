import { getAccessToken } from './auth';
import type { Property } from '@/src/types/property';

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
    role: 'staff' | 'admin';
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

export async function getProperties(params?: {
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<Property>> {
  const searchParams = new URLSearchParams();

  if (params?.page) {
    searchParams.set('page', String(params.page));
  }

  if (params?.limit) {
    searchParams.set('limit', String(params.limit));
  }

  const query = searchParams.toString();

  return apiFetch<PaginatedResponse<Property>>(
    `/properties${query ? `?${query}` : ''}`,
  );
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

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
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
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as T;
}
