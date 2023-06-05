import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SigninDTO, SignupDTO } from 'dto/auth.dto';
import { Request, Response } from 'express';
import { AccessTokenGuard, RefreshTokenGuard } from './guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  private static setCookie(token: string, res: Response) {
    res.cookie('auth-cookie', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  @Post('signup')
  async signup(@Body() dto: SignupDTO, @Res() res: Response) {
    const { accessToken, refreshToken } = await this.authService.signup(dto);
    AuthController.setCookie(refreshToken, res);
    return { accessToken: accessToken };
  }

  @Post('signin')
  async signin(
    @Body() dto: SigninDTO,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.signin(dto);
    res.cookie('auth-cookie', refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return { accessToken: accessToken };
  }

  @UseGuards(AccessTokenGuard)
  @Get('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    await this.authService.logout(req.user['id']);
    res.clearCookie('auth-cookie');
    res.end();
  }

  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken, accessToken } = await this.authService.refreshTokens(
      req.user['id'],
      req.user['refreshToken'],
    );
    AuthController.setCookie(refreshToken, res);
    return { accessToken: accessToken };
  }
}
