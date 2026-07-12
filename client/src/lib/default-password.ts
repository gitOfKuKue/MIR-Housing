/** Default password assigned when creating new accounts. */
export function getDefaultPassword(
  year: number = new Date().getFullYear(),
): string {
  return `Welcome@${year}!!!`;
}

export function isDefaultPassword(password: string): boolean {
  const trimmed = password.trim();
  if (!trimmed) return false;

  const currentYear = new Date().getFullYear();
  // Accept current and previous year in case accounts were created near year change.
  return (
    trimmed === getDefaultPassword(currentYear) ||
    trimmed === getDefaultPassword(currentYear - 1)
  );
}
