import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { MessageModule } from './message/message.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    AuthModule,
    MessageModule,
    PrismaModule,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  providers: [PrismaModule],
})
export class AppModule {}
