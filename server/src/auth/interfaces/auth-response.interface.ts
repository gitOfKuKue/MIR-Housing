import { StaffRole } from '../enums/staff-role.enum';

export interface LoginUser {
  id: string;
  email: string;
  full_name: string | null;
  role: StaffRole;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: LoginUser;
}

export interface MeResponse {
  user: LoginUser;
}

export interface LogoutResponse {
  message: string;
}

export interface ChangePasswordResponse {
  message: string;
}
