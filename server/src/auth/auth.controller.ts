import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AccessToken } from './decorators/access-token.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './guards/auth.guard';
import type { AuthUser } from './interfaces/auth-user.interface';
import type {
  ChangePasswordResponse,
  LoginResponse,
  LogoutResponse,
  MeResponse,
} from './interfaces/auth-response.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto): Promise<LoginResponse> {
    return this.authService.login(dto);
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  logout(@AccessToken() accessToken: string): Promise<LogoutResponse> {
    return this.authService.logout(accessToken);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  getMe(
    @CurrentUser() user: AuthUser,
    @AccessToken() accessToken: string,
  ): Promise<MeResponse> {
    return this.authService.getMe(user.id, accessToken);
  }

  @Post('change-password')
  @UseGuards(AuthGuard)
  changePassword(
    @AccessToken() accessToken: string,
    @Body() dto: ChangePasswordDto,
  ): Promise<ChangePasswordResponse> {
    return this.authService.changePassword(accessToken, dto);
  }
}
