import { Global, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Global()
@Module({
  controllers: [AuthController],
  providers: [AuthGuard, AuthService, RolesGuard],
  exports: [AuthGuard, AuthService, RolesGuard],
})
export class AuthModule {}
