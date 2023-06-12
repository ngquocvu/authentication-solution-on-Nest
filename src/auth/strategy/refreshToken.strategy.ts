import { Injectable, Req } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(config: ConfigService, private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        RefreshTokenStrategy.extractJWT,
      ]),
      secretOrKey: config.get('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }
  private static extractJWT(req: Request): string | null {
    if (req.cookies && req.cookies['REFRESH_TOKEN']) {
      return req.cookies['REFRESH_TOKEN'];
    }
    return null;
  }
  async validate(req: Request, payload: { id: number; email: string }) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.id,
      },
    });
    delete user.hash;
    const refreshToken = req.cookies['REFRESH_TOKEN'];
    return { ...user, refreshToken };
  }
}
