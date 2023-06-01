import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { SignupDTO } from 'dto/auth.dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}
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
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials has been taken');
        }
      } else {
        console.log(error);
        throw new InternalServerErrorException(error.message);
      }
    }
  }
}
