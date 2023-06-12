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
    res.cookie('REFRESH_TOKEN', token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      domain: 'localhost', // Two different domains (e.g. example.com and subdomain.example.com, or sub1.example.com and sub2.example.com) can only share cookies if the domain attribute is present in the header
      sameSite: 'strict', //  The SameSite attribute restricts the origins () from which the cookie may be sent. Hạn chế tên domain được gửi và giữ cookie này. Ví dụ: món quà được gửi từ 1 người cùng gia đình cho nhau.
      //Using both attributes together can provide more fine-grained control over the behavior and scope of your cookie. For example, you can set a cookie with "SameSite=Strict" to ensure it is only sent in first-party requests and use the "Domain" attribute to limit its scope to a specific domain and its subdomains.
      //https://stackoverflow.com/questions/57090774/what-are-the-security-differences-between-cookies-with-domain-vs-samesite-strict
    });
  }

  @Post('signup')
  async signup(
    @Body() dto: SignupDTO,
    @Res({ passthrough: true }) res: Response,
  ) {
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
    AuthController.setCookie(refreshToken, res);
    return { accessToken: accessToken };
  }

  @UseGuards(AccessTokenGuard)
  @Get('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(req.user['id']);
    res.clearCookie('REFRESH_TOKEN');
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
