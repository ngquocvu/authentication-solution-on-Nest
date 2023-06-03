import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { SigninDTO, SignupDTO } from 'dto/auth.dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
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
    const secret = this.config.get('JWT_SECRET');
    const token = await this.jwt.sign(
      { id, email },
      {
        expiresIn: '15m',
        secret,
      },
    );
    return {
      access_token: token,
    };
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
      return this.signToken(user.id, user.email);
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
      return this.signToken(user.id, user.email);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials has been taken');
        }
      } else {
        console.log(error.message);
        throw new InternalServerErrorException(error.message);
      }
    }
  }
}
