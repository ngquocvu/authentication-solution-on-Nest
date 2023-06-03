import { Body, Controller, Get, Post, UseGuards, Req } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageDto } from '../../dto';
import { JwtGuard } from 'src/auth/guard';
import { Request } from 'express';

@Controller('message')
export class MessageController {
  constructor(private messageService: MessageService) {}

  @Post()
  sendMessage(@Body() dto: MessageDto) {
    return this.messageService.sendMessage(dto);
  }

  @UseGuards(JwtGuard)
  @Get()
  getAllMessage(@Req() req: Request) {
    console.log(req.user);
    return this.messageService.getAllMessages();
  }
}
