import {
  Body,
  Controller,
  Get,
  Global,
  HttpCode,
  Module,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import type { Response } from 'express';
import { env } from '../../config/environment';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './auth.dto';
const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/api',
};
@Controller('auth')
class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Post('register') register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }
  @Post('login')
  @HttpCode(200)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.auth.login(dto);
    response.cookie('access_token', result.token, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });
    return result.user;
  }
  @Post('logout')
  @HttpCode(204)
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('access_token', cookieOptions);
  }
  @Get('me') @UseGuards(AuthGuard) me(@CurrentUser() id: string) {
    return this.auth.me(id);
  }
}
@Global()
@Module({
  imports: [
    JwtModule.register({
      secret: env.JWT_SECRET,
      signOptions: { expiresIn: '15m', algorithm: 'HS256' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard],
  exports: [AuthGuard, JwtModule],
})
export class AuthModule {}
