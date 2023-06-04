import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { SigninDTO, SignupDTO } from 'dto/auth.dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/binary';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signToken(id: number, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(
        { id, email },
        {
          expiresIn: '15m',
          secret: this.config.get('JWT_ACCESS_SECRET'),
        },
      ),
      this.jwt.signAsync(
        { id, email },
        {
          expiresIn: '7d',
          secret: this.config.get('JWT_REFRESH_SECRET'),
        },
      ),
    ]);
    return { accessToken, refreshToken };
  }

  async updateRefreshToken(id: number, refreshToken: string) {
    const hashedRefreshToken = await argon.hash(refreshToken);
    await this.prisma.user.update({
      where: {
        id: id,
      },
      data: {
        refreshToken: hashedRefreshToken,
      },
    });
  }

  async signin(signinDTO: SigninDTO) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email: signinDTO.email,
        },
      });
      if (!user) {
        throw new ForbiddenException('Credentials incorrect');
      }
      const pwMatch = await argon.verify(user.hash, signinDTO.password);
      if (!pwMatch) {
        throw new ForbiddenException('Credentials incorrect');
      }
      const tokens = await this.signToken(user.id, user.email);
      this.updateRefreshToken(user.id, tokens['refreshToken']);
      return tokens;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async signup(signupDTO: SignupDTO) {
    try {
      const hash = await argon.hash(signupDTO.password);
      const user = await this.prisma.user.create({
        data: {
          email: signupDTO.email,
          name: signupDTO.name,
          hash: hash,
          isAdmin: false,
          website: {
            connect: {
              id: signupDTO.websiteId,
            },
          },
        },
      });
      const tokens = await this.signToken(user.id, user.email);
      this.updateRefreshToken(user.id, tokens['refreshToken']);
      return tokens;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials has been taken');
        }
      } else {
        throw new InternalServerErrorException(error.message);
      }
    }
  }

  async logout(id: number) {
    await this.prisma.user.update({
      where: {
        id: id,
      },
      data: {
        refreshToken: null,
      },
    });
  }

  async refreshTokens(id: number, refreshToken: string) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });
      if (!user || !user.refreshToken) {
        throw new ForbiddenException('Access denied');
      }
      const isMatched = argon.verify(user.refreshToken, refreshToken);
      if (isMatched) {
        const tokens = await this.signToken(id, user.email);
        this.updateRefreshToken(id, tokens.refreshToken);
        return tokens;
      } else {
        throw new ForbiddenException('Access denied');
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
