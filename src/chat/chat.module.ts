import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { PrismaModule } from 'src/prisma/prisma.module';
import { VideoCallModule } from 'src/videocall/videocall.module';

@Module({
  imports: [PrismaModule, VideoCallModule],
  providers: [ChatService, ChatGateway],
})
export class ChatModule {}
