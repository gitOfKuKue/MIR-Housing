export enum StaffRole {
  Admin = 'admin',
  Sale = 'sale',
  Contributor = 'contributor',
}

/** Roles that can manage properties like an admin (create/delete). */
export const MANAGEMENT_ROLES: StaffRole[] = [
  StaffRole.Admin,
  StaffRole.Sale,
];

/** Roles that can open the create-account settings section. */
export const ACCOUNT_CREATOR_ROLES: StaffRole[] = [
  StaffRole.Admin,
  StaffRole.Sale,
];

export function canManageProperties(role: StaffRole | string | null | undefined): boolean {
  const normalized = role === 'staff' ? StaffRole.Sale : role;
  return normalized === StaffRole.Admin || normalized === StaffRole.Sale;
}

export function canCreateAccounts(role: StaffRole | string | null | undefined): boolean {
  const normalized = role === 'staff' ? StaffRole.Sale : role;
  return normalized === StaffRole.Admin || normalized === StaffRole.Sale;
}

export function canCreateRole(
  actorRole: StaffRole | string,
  targetRole: StaffRole,
): boolean {
  const normalized =
    actorRole === 'staff' ? StaffRole.Sale : (actorRole as StaffRole);
  return getCreatableRoles(normalized).includes(targetRole);
}

export function getCreatableRoles(actorRole: StaffRole): StaffRole[] {
  if (actorRole === StaffRole.Admin) {
    return [StaffRole.Sale, StaffRole.Contributor];
  }

  if (actorRole === StaffRole.Sale) {
    return [StaffRole.Contributor];
  }

  return [];
}
