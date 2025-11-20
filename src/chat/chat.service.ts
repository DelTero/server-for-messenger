import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import { ChatRoom } from './entities/chat-room.entity';
import { Message } from './entities/message.entity';
import { User } from '../users/entities/user.entity';
import { MessageData } from './interfaces/messageData.interface';
import { ChatMessageView } from './interfaces/chatMessageView.interface';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatRoom)
    private readonly roomRepo: EntityRepository<ChatRoom>,
    @InjectRepository(Message)
    private readonly messageRepo: EntityRepository<Message>,
    @InjectRepository(User)
    private readonly userRepo: EntityRepository<User>,
  ) {}

  async getUserById(userId: string): Promise<User> {
    const user = await this.userRepo.findOne({ id: userId });

    if (!user) {
      throw new NotFoundException('Пользователь с таким id не найден');
    }

    return user;
  }

  async sendMessage(roomId: string, data: MessageData): Promise<ChatMessageView> {
    const room = await this.roomRepo.findOneOrFail({ id: roomId });
    const user = await this.getUserById(data.userId);

    const message = this.messageRepo.create({
      content: data.content,
      user,
      room,
      createdAt: new Date(),
    });

    await this.messageRepo.getEntityManager().persistAndFlush(message);

    return {
      id: message.id,
      content: message.content,
      userId: user.id,
      roomId: room.id,
      createdAt: message.createdAt,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }

  async getRoomMessages(roomId: string): Promise<ChatMessageView[]> {
    const messages = await this.messageRepo.find(
      { room: { id: roomId } },
      {
        populate: ['user', 'room'],
        orderBy: { createdAt: 'ASC' },
      },
    );

    return messages.map((msg) => ({
      id: msg.id,
      content: msg.content,
      userId: msg.user.id,
      roomId: msg.room.id,
      createdAt: msg.createdAt,
      user: {
        id: msg.user.id,
        name: msg.user.name,
        email: msg.user.email,
      },
    }));
  }

  async getOrCreatePrivateRoom(user1Id: string, user2Id: string): Promise<string> {
    const roomId = [user1Id, user2Id].sort().join('_private_');

    let room = await this.roomRepo.findOne({ id: roomId });

    if (!room) {
      room = this.roomRepo.create({
        id: roomId,
        name: `Private_${roomId}`,
        isPrivate: true,
        createdAt: new Date(),
      });
      await this.roomRepo.getEntityManager().persistAndFlush(room);
    }

    return room.id;
  }
}
