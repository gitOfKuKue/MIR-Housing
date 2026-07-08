import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../supabase/supabase.constants';
import { SupabaseService } from '../supabase/supabase.service';
import { LoginDto } from './dto/login.dto';
import { StaffRole } from './enums/staff-role.enum';
import {
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
        role: profile?.role ?? StaffRole.Staff,
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
        role: profile?.role ?? StaffRole.Staff,
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
