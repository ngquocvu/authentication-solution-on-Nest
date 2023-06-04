import { Body, Controller, Get, Post, UseGuards, Req } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageDto } from '../../dto';
import { Request } from 'express';
import { AccessTokenGuard } from 'src/auth/guard';

@Controller('message')
export class MessageController {
  constructor(private messageService: MessageService) {}

  @Post()
  sendMessage(@Body() dto: MessageDto) {
    return this.messageService.sendMessage(dto);
  }

  @UseGuards(AccessTokenGuard)
  @Get()
  getAllMessage() {
    return this.messageService.getAllMessages();
  }
}
