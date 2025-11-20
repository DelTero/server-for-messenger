import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ChatRoom } from './entities/chat-room.entity';
import { Message } from './entities/message.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [MikroOrmModule.forFeature([ChatRoom, Message, User])],
  providers: [ChatGateway, ChatService],
  exports: [ChatService],
})
export class ChatModule {}
