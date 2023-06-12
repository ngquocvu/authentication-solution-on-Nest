import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AccessTokenGuard } from 'src/auth/guard';
import { Request } from 'express';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  @Get('me')
  @UseGuards(AccessTokenGuard)
  getCurrentUserInfo(@Req() req: Request) {
    return this.userService.getUserInfo(req.user['id']);
  }
}
