export type StaffRole =
  | 'super_admin'
  | 'admin'
  | 'sale'
  | 'contributor';

/**
 * Level mapping:
 * 1 super_admin – Super Administrator
 * 2 admin – Administrator
 * 3 sale – Sales Staff
 * 4 contributor – Sales Partner (Collaborator)
 */

export const PROPERTY_MANAGER_ROLES: StaffRole[] = [
  'super_admin',
  'admin',
  'sale',
];

/** @deprecated Prefer PROPERTY_MANAGER_ROLES */
export const MANAGEMENT_ROLES = PROPERTY_MANAGER_ROLES;

export function normalizeStaffRole(
  role: StaffRole | string | null | undefined,
): StaffRole | null {
  if (!role) return null;
  if (role === 'staff') return 'sale';
  if (
    role === 'super_admin' ||
    role === 'admin' ||
    role === 'sale' ||
    role === 'contributor'
  ) {
    return role;
  }
  return null;
}

export function canManageProperties(
  role: StaffRole | string | null | undefined,
): boolean {
  const normalized = normalizeStaffRole(role);
  return (
    normalized === 'super_admin' ||
    normalized === 'admin' ||
    normalized === 'sale'
  );
}

export function canEditProperties(
  role: StaffRole | string | null | undefined,
): boolean {
  return canManageProperties(role);
}

export function canCreateAccounts(
  role: StaffRole | string | null | undefined,
): boolean {
  return canManageProperties(role);
}

export function canViewLandlordContacts(
  role: StaffRole | string | null | undefined,
): boolean {
  return canManageProperties(role);
}

export function canViewZaloGroupLink(
  role: StaffRole | string | null | undefined,
): boolean {
  return canViewLandlordContacts(role);
}

export function canCopyRoomInfo(
  role: StaffRole | string | null | undefined,
): boolean {
  return Boolean(normalizeStaffRole(role));
}

export function canDownloadImages(
  role: StaffRole | string | null | undefined,
): boolean {
  return Boolean(normalizeStaffRole(role));
}

export function canManageAccount(
  actorRole: StaffRole | string,
  targetRole: StaffRole | string,
): boolean {
  const actor = normalizeStaffRole(actorRole);
  const target = normalizeStaffRole(targetRole);
  if (!actor || !target) return false;

  if (actor === 'super_admin') {
    return target === 'admin';
  }
  if (actor === 'admin') {
    return target === 'sale' || target === 'contributor';
  }
  if (actor === 'sale') {
    return target === 'contributor';
  }
  return false;
}

export function getCreatableRoles(
  actorRole: StaffRole | string,
): StaffRole[] {
  const normalized = normalizeStaffRole(actorRole);
  if (!normalized) return [];

  if (normalized === 'super_admin') {
    return ['admin'];
  }

  if (normalized === 'admin') {
    return ['sale', 'contributor'];
  }

  if (normalized === 'sale') {
    return ['contributor'];
  }

  return [];
}
