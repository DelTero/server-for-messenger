import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class VideoCallService {
  constructor(
    private readonly userService: UsersService,
    private prisma: PrismaService,
  ) {}

  // Получение информации о пользователе по ID
  async getUserById(userId: string) {
    return await this.userService.findById(parseInt(userId));
  }

  async getOrCreatePrivateRoom(user1Id: string, user2Id: string) {
    // Создаем уникальный ID комнаты, сортируя ID пользователей
    const roomId = [user1Id, user2Id].sort().join('_private_');

    const existingRoom = await this.prisma.chatRoom.findUnique({
      where: { id: roomId },
    });

    if (existingRoom) {
      return roomId;
    }

    // Если комната не существует, создаем новую
    await this.prisma.chatRoom.create({
      data: {
        id: roomId,
        name: `Private_${roomId}`,
        isPrivate: true,
      },
    });

    return roomId;
  }
}
