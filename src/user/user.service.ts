import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  async getUserInfo(id: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        name: true,
        website: {
          select: {
            name: true,
          },
        },
        createAt: true,
        updateAt: true,
        email: true,
      },
    });
    return user;
  }
}
