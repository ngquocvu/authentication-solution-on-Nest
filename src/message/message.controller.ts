import { Body, Controller, Get, Post } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageDto } from '../../dto';

@Controller('message')
export class MessageController {
  constructor(private messageService: MessageService) {}

  @Post()
  sendMessage(@Body() dto: MessageDto) {
    return this.messageService.sendMessage(dto);
  }
  @Get()
  getAllMessage() {
    return this.messageService.getAllMessages();
  }
}
