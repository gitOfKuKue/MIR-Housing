export type StaffRole =
  | 'super_admin'
  | 'admin'
  | 'sale'
  | 'contributor';

export interface AuthUser {
  id: string;
  email: string;
  full_name: string | null;
  role: StaffRole;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  user: AuthUser;
}

const ACCESS_TOKEN_KEY = 'mir_housing_access_token';
const REFRESH_TOKEN_KEY = 'mir_housing_refresh_token';
const USER_KEY = 'mir_housing_user';
const SESSION_EXPIRES_AT_KEY = 'mir_housing_session_expires_at';

export function setSession(session: AuthSession, expiresInSeconds?: number): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, session.access_token);
  localStorage.setItem(REFRESH_TOKEN_KEY, session.refresh_token);
  localStorage.setItem(USER_KEY, JSON.stringify(session.user));

  if (expiresInSeconds) {
    localStorage.setItem(
      SESSION_EXPIRES_AT_KEY,
      String(Date.now() + expiresInSeconds * 1000),
    );
  }
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getAuthUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setAuthUser(user: AuthUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(SESSION_EXPIRES_AT_KEY);
}

export function isSessionExpired(): boolean {
  if (typeof window === 'undefined') return false;

  const expiresAt = localStorage.getItem(SESSION_EXPIRES_AT_KEY);
  if (!expiresAt) return false;

  return Date.now() >= Number(expiresAt);
}

export function handleSessionExpired(): void {
  clearSession();

  if (typeof window === 'undefined') return;
  if (window.location.pathname === '/login') return;

  window.location.replace('/login');
}

// backwards compatibility
export function setAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  clearSession();
}
