import { Controller, Post, Body, HttpCode, HttpStatus, ConflictException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/user.entity';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  /** One-time setup: creates the first admin user. Fails if any user already exists. */
  @Post('setup')
  @HttpCode(HttpStatus.CREATED)
  async setup(@Body() body: { name: string; email: string; password: string }) {
    const existing = await this.usersService.findAll();
    if (existing.length > 0) {
      throw new ConflictException('Setup already completed. Use /auth/login.');
    }
    const user = await this.usersService.create({
      name: body.name,
      email: body.email,
      password: body.password,
      role: UserRole.ADMIN,
      isActive: true,
    });
    return this.authService.login(body.email, body.password);
  }
}
