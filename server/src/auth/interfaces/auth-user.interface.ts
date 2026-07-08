import { StaffRole } from '../enums/staff-role.enum';

export interface AuthUser {
  id: string;
  email?: string;
  role: StaffRole;
}
