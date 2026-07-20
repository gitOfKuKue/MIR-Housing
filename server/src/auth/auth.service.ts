import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../supabase/supabase.constants';
import { SupabaseService } from '../supabase/supabase.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import {
  canCreateRole,
  canManageAccount,
  getCreatableRoles,
  StaffRole,
} from './enums/staff-role.enum';
import type { AuthUser } from './interfaces/auth-user.interface';
import {
  ChangePasswordResponse,
  CreateUserResponse,
  LoginResponse,
  LogoutResponse,
  MeResponse,
} from './interfaces/auth-response.interface';

interface ProfileRow {
  full_name: string | null;
  role: StaffRole;
  is_active?: boolean | null;
}

export interface ManagedUser {
  id: string;
  email: string;
  full_name: string | null;
  role: StaffRole;
  is_active: boolean;
  deactivated_at: string | null;
  created_at: string | null;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
    private readonly supabaseService: SupabaseService,
  ) {}

  async login(dto: LoginDto): Promise<LoginResponse> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });

    if (error || !data.session || !data.user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const profile = await this.getProfile(
      data.user.id,
      data.session.access_token,
    );

    if (profile && profile.is_active === false) {
      await this.supabaseService
        .getClient(data.session.access_token)
        .auth.signOut();
      throw new UnauthorizedException(
        'This account has been deactivated. Contact your administrator.',
      );
    }

    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in ?? 3600,
      token_type: 'bearer',
      user: {
        id: data.user.id,
        email: data.user.email ?? dto.email,
        full_name: profile?.full_name ?? null,
        role: profile?.role ?? StaffRole.Contributor,
      },
    };
  }

  async logout(accessToken: string): Promise<LogoutResponse> {
    const supabase = this.supabaseService.getClient(accessToken);
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    return { message: 'Logged out successfully' };
  }

  async createUser(
    actor: AuthUser,
    dto: CreateUserDto,
  ): Promise<CreateUserResponse> {
    const fullName = dto.full_name?.trim() || null;
    const role = dto.role ?? StaffRole.Contributor;

    if (!canCreateRole(actor.role, role)) {
      throw new ForbiddenException(
        'You are not allowed to create an account with that role',
      );
    }

    const admin = this.supabaseService.getServiceClient();

    const { data, error } = await admin.auth.admin.createUser({
      email: dto.email.trim().toLowerCase(),
      password: dto.password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      },
    });

    if (error || !data.user) {
      throw new BadRequestException(
        error?.message ?? 'Failed to create user account',
      );
    }

    const { error: profileError } = await admin
      .from('profiles')
      .update({
        full_name: fullName,
        role,
        is_active: true,
        deactivated_at: null,
      })
      .eq('id', data.user.id);

    if (profileError) {
      throw new InternalServerErrorException(profileError.message);
    }

    return {
      message: 'User account created successfully',
      user: {
        id: data.user.id,
        email: data.user.email ?? dto.email.trim().toLowerCase(),
        full_name: fullName,
        role,
      },
    };
  }

  async listManagedUsers(actor: AuthUser): Promise<{ data: ManagedUser[] }> {
    const allowedRoles = getCreatableRoles(actor.role as StaffRole);
    if (allowedRoles.length === 0) {
      throw new ForbiddenException('You are not allowed to manage accounts');
    }

    const admin = this.supabaseService.getServiceClient();
    const { data: profiles, error } = await admin
      .from('profiles')
      .select('id, full_name, role, is_active, deactivated_at, created_at')
      .in('role', allowedRoles)
      .order('created_at', { ascending: false });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    const { data: authUsers, error: authError } =
      await admin.auth.admin.listUsers({ perPage: 1000 });

    if (authError) {
      throw new InternalServerErrorException(authError.message);
    }

    const emailById = new Map(
      (authUsers.users ?? []).map((user) => [user.id, user.email ?? '']),
    );

    return {
      data: (profiles ?? []).map((profile) => ({
        id: profile.id as string,
        email: emailById.get(profile.id as string) ?? '',
        full_name: (profile.full_name as string | null) ?? null,
        role: profile.role as StaffRole,
        is_active: profile.is_active !== false,
        deactivated_at: (profile.deactivated_at as string | null) ?? null,
        created_at: (profile.created_at as string | null) ?? null,
      })),
    };
  }

  async setUserActive(
    actor: AuthUser,
    userId: string,
    isActive: boolean,
  ): Promise<{ message: string; user: ManagedUser }> {
    if (userId === actor.id) {
      throw new BadRequestException('You cannot deactivate your own account');
    }

    const admin = this.supabaseService.getServiceClient();
    const { data: profile, error } = await admin
      .from('profiles')
      .select('id, full_name, role, is_active, deactivated_at, created_at')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }
    if (!profile) {
      throw new NotFoundException('User not found');
    }

    if (!canManageAccount(actor.role, profile.role as StaffRole)) {
      throw new ForbiddenException(
        'You are not allowed to manage this account',
      );
    }

    const { data: updated, error: updateError } = await admin
      .from('profiles')
      .update({
        is_active: isActive,
        deactivated_at: isActive ? null : new Date().toISOString(),
      })
      .eq('id', userId)
      .select('id, full_name, role, is_active, deactivated_at, created_at')
      .single();

    if (updateError || !updated) {
      throw new InternalServerErrorException(
        updateError?.message ?? 'Failed to update account',
      );
    }

    if (!isActive) {
      await admin.auth.admin.updateUserById(userId, { ban_duration: '876000h' });
    } else {
      await admin.auth.admin.updateUserById(userId, { ban_duration: 'none' });
    }

    const { data: authUser } = await admin.auth.admin.getUserById(userId);

    return {
      message: isActive
        ? 'Account reactivated successfully'
        : 'Account deactivated successfully',
      user: {
        id: updated.id as string,
        email: authUser.user?.email ?? '',
        full_name: (updated.full_name as string | null) ?? null,
        role: updated.role as StaffRole,
        is_active: updated.is_active !== false,
        deactivated_at: (updated.deactivated_at as string | null) ?? null,
        created_at: (updated.created_at as string | null) ?? null,
      },
    };
  }

  async deleteAdminAccount(
    actor: AuthUser,
    userId: string,
  ): Promise<{ message: string }> {
    if (actor.role !== StaffRole.SuperAdmin) {
      throw new ForbiddenException(
        'Only Super Administrators can delete Administrator accounts',
      );
    }
    if (userId === actor.id) {
      throw new BadRequestException('You cannot delete your own account');
    }

    const admin = this.supabaseService.getServiceClient();
    const { data: profile, error } = await admin
      .from('profiles')
      .select('id, role')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }
    if (!profile) {
      throw new NotFoundException('User not found');
    }
    if (profile.role !== StaffRole.Admin) {
      throw new ForbiddenException(
        'Only Administrator accounts can be deleted by Super Administrators',
      );
    }

    const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
    if (deleteError) {
      throw new InternalServerErrorException(deleteError.message);
    }

    return { message: 'Administrator account deleted successfully' };
  }

  async changePassword(
    accessToken: string,
    dto: ChangePasswordDto,
  ): Promise<ChangePasswordResponse> {
    if (dto.current_password === dto.new_password) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }

    const supabase = this.supabaseService.getClient(accessToken);

    const { data: userData, error: userError } =
      await supabase.auth.getUser(accessToken);

    if (userError || !userData.user?.email) {
      throw new UnauthorizedException('Invalid or expired access token');
    }

    const { data: signInData, error: verifyError } =
      await this.supabase.auth.signInWithPassword({
        email: userData.user.email,
        password: dto.current_password,
      });

    if (verifyError || !signInData?.session) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    await this.supabase.auth.setSession({
      access_token: signInData.session.access_token,
      refresh_token: signInData.session.refresh_token,
    });

    const { error: updateError } = await this.supabase.auth.updateUser({
      password: dto.new_password,
    });

    if (updateError) {
      throw new BadRequestException(updateError.message);
    }

    return { message: 'Password updated successfully' };
  }

  async getMe(userId: string, accessToken: string): Promise<MeResponse> {
    const supabase = this.supabaseService.getClient(accessToken);

    const { data: userData, error: userError } =
      await supabase.auth.getUser(accessToken);

    if (userError || !userData.user) {
      throw new UnauthorizedException('Invalid or expired access token');
    }

    const profile = await this.getProfile(userId, accessToken);

    if (profile && profile.is_active === false) {
      throw new UnauthorizedException(
        'This account has been deactivated. Contact your administrator.',
      );
    }

    return {
      user: {
        id: userData.user.id,
        email: userData.user.email ?? '',
        full_name: profile?.full_name ?? null,
        role: profile?.role ?? StaffRole.Contributor,
      },
    };
  }

  private async getProfile(
    userId: string,
    accessToken: string,
  ): Promise<ProfileRow | null> {
    const supabase = this.supabaseService.getClient(accessToken);

    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, role, is_active')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      // Older DBs may not have is_active yet — fall back.
      if (error.message.includes('is_active')) {
        const fallback = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', userId)
          .maybeSingle();
        if (fallback.error) {
          throw new InternalServerErrorException(fallback.error.message);
        }
        return fallback.data
          ? { ...fallback.data, is_active: true }
          : null;
      }
      throw new InternalServerErrorException(error.message);
    }

    return data as ProfileRow | null;
  }
}
