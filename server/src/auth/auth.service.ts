import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../supabase/supabase.constants';
import { SupabaseService } from '../supabase/supabase.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { canCreateRole, StaffRole } from './enums/staff-role.enum';
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

    // `updateUser` requires an active auth session. The initial accessToken
    // header isn't guaranteed to hydrate the auth client session, so we set it.
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
      .select('full_name, role')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return data as ProfileRow | null;
  }
}
