export enum StaffRole {
  SuperAdmin = 'super_admin',
  Admin = 'admin',
  Sale = 'sale',
  Contributor = 'contributor',
}

/**
 * Level mapping:
 * 1 super_admin – Super Administrator
 * 2 admin – Administrator
 * 3 sale – Sales Staff
 * 4 contributor – Sales Partner (Collaborator)
 */

/** Roles that can create/edit/delete properties and rooms. */
export const PROPERTY_MANAGER_ROLES: StaffRole[] = [
  StaffRole.SuperAdmin,
  StaffRole.Admin,
  StaffRole.Sale,
];

/** Roles that can open the create-account settings section. */
export const ACCOUNT_CREATOR_ROLES: StaffRole[] = [
  StaffRole.SuperAdmin,
  StaffRole.Admin,
  StaffRole.Sale,
];

/** @deprecated Prefer PROPERTY_MANAGER_ROLES */
export const MANAGEMENT_ROLES = PROPERTY_MANAGER_ROLES;

export function normalizeStaffRole(
  role: StaffRole | string | null | undefined,
): StaffRole | null {
  if (!role) return null;
  if (role === 'staff') return StaffRole.Sale;
  if (
    role === StaffRole.SuperAdmin ||
    role === StaffRole.Admin ||
    role === StaffRole.Sale ||
    role === StaffRole.Contributor
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
    normalized === StaffRole.SuperAdmin ||
    normalized === StaffRole.Admin ||
    normalized === StaffRole.Sale
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
  const normalized = normalizeStaffRole(role);
  return (
    normalized === StaffRole.SuperAdmin ||
    normalized === StaffRole.Admin ||
    normalized === StaffRole.Sale
  );
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

export function canCreateRole(
  actorRole: StaffRole | string,
  targetRole: StaffRole,
): boolean {
  const normalized = normalizeStaffRole(actorRole);
  if (!normalized) return false;
  return getCreatableRoles(normalized).includes(targetRole);
}

export function canManageAccount(
  actorRole: StaffRole | string,
  targetRole: StaffRole | string,
): boolean {
  const actor = normalizeStaffRole(actorRole);
  const target = normalizeStaffRole(targetRole);
  if (!actor || !target) return false;

  if (actor === StaffRole.SuperAdmin) {
    return target === StaffRole.Admin;
  }
  if (actor === StaffRole.Admin) {
    return target === StaffRole.Sale || target === StaffRole.Contributor;
  }
  if (actor === StaffRole.Sale) {
    return target === StaffRole.Contributor;
  }
  return false;
}

export function getCreatableRoles(actorRole: StaffRole): StaffRole[] {
  if (actorRole === StaffRole.SuperAdmin) {
    return [StaffRole.Admin];
  }

  if (actorRole === StaffRole.Admin) {
    return [StaffRole.Sale, StaffRole.Contributor];
  }

  if (actorRole === StaffRole.Sale) {
    return [StaffRole.Contributor];
  }

  return [];
}
