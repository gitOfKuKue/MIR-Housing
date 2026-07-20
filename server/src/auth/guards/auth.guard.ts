import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { StaffRole } from '../enums/staff-role.enum';
import { AuthUser } from '../interfaces/auth-user.interface';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user?: AuthUser }>();
    const authorization = request.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authorization.slice('Bearer '.length).trim();

    if (!token) {
      throw new UnauthorizedException('Missing access token');
    }

    const supabase = this.supabaseService.getClient(token);

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      throw new UnauthorizedException('Invalid or expired access token');
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, is_active')
      .eq('id', data.user.id)
      .maybeSingle();

    let role = StaffRole.Contributor;
    let isActive = true;

    if (profileError?.message?.includes('is_active')) {
      const { data: fallback } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle();
      role = (fallback?.role as StaffRole) ?? StaffRole.Contributor;
    } else if (profile) {
      role = (profile.role as StaffRole) ?? StaffRole.Contributor;
      isActive = profile.is_active !== false;
    }

    if (!isActive) {
      throw new UnauthorizedException(
        'This account has been deactivated. Contact your administrator.',
      );
    }

    request.user = {
      id: data.user.id,
      email: data.user.email,
      role,
    };
    request.headers['x-access-token'] = token;

    return true;
  }
}
