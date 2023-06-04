import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SigninDTO, SignupDTO } from 'dto/auth.dto';
import { Request } from 'express';
import { AccessTokenGuard, RefreshTokenGuard } from './guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body() dto: SignupDTO) {
    return this.authService.signup(dto);
  }

  @Post('signin')
  signin(@Body() dto: SigninDTO) {
    return this.authService.signin(dto);
  }

  @UseGuards(AccessTokenGuard)
  @Get('logout')
  logout(@Req() req: Request) {
    this.authService.logout(req.user['id']);
  }

  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  refresh(@Req() req: Request) {
    return this.authService.refreshTokens(
      req.user['id'],
      req.user['refreshToken'],
    );
  }
}
