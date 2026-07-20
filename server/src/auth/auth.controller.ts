import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AccessToken } from './decorators/access-token.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { Roles } from './decorators/roles.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { SetUserActiveDto } from './dto/set-user-active.dto';
import { StaffRole } from './enums/staff-role.enum';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';
import type { AuthUser } from './interfaces/auth-user.interface';
import type {
  ChangePasswordResponse,
  CreateUserResponse,
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

  @Get('users')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(StaffRole.SuperAdmin, StaffRole.Admin, StaffRole.Sale)
  listUsers(@CurrentUser() user: AuthUser) {
    return this.authService.listManagedUsers(user);
  }

  @Post('users')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(StaffRole.SuperAdmin, StaffRole.Admin, StaffRole.Sale)
  createUser(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateUserDto,
  ): Promise<CreateUserResponse> {
    return this.authService.createUser(user, dto);
  }

  @Patch('users/:id/active')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(StaffRole.SuperAdmin, StaffRole.Admin, StaffRole.Sale)
  setUserActive(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SetUserActiveDto,
  ) {
    return this.authService.setUserActive(user, id, dto.is_active);
  }

  @Delete('users/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(StaffRole.SuperAdmin)
  deleteAdmin(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.authService.deleteAdminAccount(user, id);
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
