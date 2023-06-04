import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { MessageDto } from '../../dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}
  async sendMessage(dto: MessageDto) {
    try {
      const message = await this.prisma.message.create({
        data: {
          email: dto.email,
          phone: dto.phone,
          website: {
            connect: {
              id: dto.websiteId,
            },
          },
          title: dto.title,
          description: dto.description,
        },
      });
      return message;
    } catch (error) {
      throw new BadRequestException();
    }
  }
  async getAllMessages(websiteId: number) {
    try {
      const allMessages = await this.prisma.message.findMany({
        where: {
          websiteId: websiteId,
        },
      });
      return allMessages;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new BadRequestException();
      }
    }
  }
}
