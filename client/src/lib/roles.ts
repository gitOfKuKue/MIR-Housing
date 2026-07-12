export type StaffRole = 'admin' | 'sale' | 'contributor';

export const MANAGEMENT_ROLES: StaffRole[] = ['admin', 'sale'];

export function canManageProperties(
  role: StaffRole | string | null | undefined,
): boolean {
  const normalized = role === 'staff' ? 'sale' : role;
  return normalized === 'admin' || normalized === 'sale';
}

export function canCreateAccounts(
  role: StaffRole | string | null | undefined,
): boolean {
  const normalized = role === 'staff' ? 'sale' : role;
  return normalized === 'admin' || normalized === 'sale';
}

export function getCreatableRoles(
  actorRole: StaffRole | string,
): StaffRole[] {
  const normalized = actorRole === 'staff' ? 'sale' : actorRole;

  if (normalized === 'admin') {
    return ['sale', 'contributor'];
  }

  if (normalized === 'sale') {
    return ['contributor'];
  }

  return [];
}
