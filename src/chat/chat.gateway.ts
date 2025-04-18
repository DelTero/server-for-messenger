import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { VideoCallService } from '../videocall/videocall.service';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway {
  constructor(
    private readonly chatService: ChatService,
    private readonly videoCallService: VideoCallService,
  ) {}

  @WebSocketServer()
  server!: Server;

  // =============== Общие методы ===============

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);

    const userId = client.data.userId;
    if (userId) {
      console.log(`Пользователь ${userId} вышел из сети`);
    }
  }

  @SubscribeMessage('userOnline')
  handleUserOnline(@MessageBody() userId: string, @ConnectedSocket() client: Socket) {
    // Присоединяем пользователя к его персональной комнате
    const userRoom = userId;
    client.join(userRoom);

    // Сохраняем ID пользователя в данных сокета
    client.data.userId = userId;

    console.log(`Пользователь ${userId} онлайн`);
    return { event: 'userOnline', data: { success: true } };
  }

  // =============== Функциональность чата ===============

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(@MessageBody() roomId: string, @ConnectedSocket() client: Socket) {
    client.leave(roomId);
    return { event: 'leaveRoom', data: `Left room ${roomId}` };
  }

  @SubscribeMessage('newMessage')
  async handleNewMessage(
    @MessageBody() data: { roomId: string; message: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const messageData = {
      content: data.message,
      userId: parseInt(data.userId),
      roomId: data.roomId,
    };

    // Сохраняем сообщение через сервис
    const savedMessage = await this.chatService.sendMessage(data.roomId, messageData);

    // Отправляем сообщение всем в комнате
    this.server.to(data.roomId).emit('onMessage', savedMessage);

    return { event: 'newMessage', data: savedMessage };
  }

  @SubscribeMessage('startPrivateChat')
  async handleStartPrivateChat(
    @MessageBody() data: { fromUserId: string; toUserId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const roomId = await this.chatService.getOrCreatePrivateRoom(data.fromUserId, data.toUserId);
    client.join(roomId);

    const messages = await this.chatService.getRoomMessages(roomId);
    return { event: 'privateChat', data: { roomId, messages } };
  }

  @SubscribeMessage('sendPrivateMessage')
  async handlePrivateMessage(
    @MessageBody() data: { fromUserId: string; toUserId: string; message: string },
    @ConnectedSocket() client: Socket,
  ) {
    const roomId = await this.chatService.getOrCreatePrivateRoom(data.fromUserId, data.toUserId);

    const messageData = {
      content: data.message,
      userId: parseInt(data.fromUserId),
      roomId: roomId,
    };

    const savedMessage = await this.chatService.sendMessage(roomId, messageData);

    // Отправляем сообщение участникам приватного чата
    this.server.to(roomId).emit('onPrivateMessage', { message: savedMessage, fromUserId: data.fromUserId });

    // Отправляем уведомление получателю в его персональную комнату
    this.server.to(data.toUserId).emit('newMessageNotification', {
      fromUserId: data.fromUserId,
      messagePreview: data.message.substring(0, 30) + (data.message.length > 30 ? '...' : ''),
      roomId: roomId,
      timestamp: new Date(),
    });

    return { event: 'privateMessage', data: savedMessage };
  }

  // =============== Функциональность видеозвонков ===============

  // Инициация звонка
  @SubscribeMessage('call-user')
  async handleCallUser(
    @MessageBody() data: { offer: RTCSessionDescriptionInit; to: string; from: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = await this.videoCallService.getUserById(data.from);
    const callerName = user?.name || 'Неизвестный пользователь';

    console.log(`Звонок от ${data.from} к ${data.to}`);

    this.server.to(data.to).emit('incoming-call', {
      offer: data.offer,
      from: data.from,
      fromName: callerName,
    });
  }

  // Принятие звонка
  @SubscribeMessage('call-accept')
  handleCallAccepted(
    @MessageBody() data: { answer: RTCSessionDescriptionInit; to: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.log(`Звонок принят, отправка ответа к ${data.to}`);

    this.server.to(data.to).emit('call-accepted', {
      answer: data.answer,
    });
  }

  // Передача ICE кандидатов
  @SubscribeMessage('ice-candidate')
  handleIceCandidate(
    @MessageBody() data: { candidate: RTCIceCandidateInit; to: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.log(`ICE кандидат для ${data.to}`);

    this.server.to(data.to).emit('ice-candidate', {
      candidate: data.candidate,
    });
  }

  // Завершение звонка
  @SubscribeMessage('end-call')
  handleEndCall(@MessageBody() data: { to: string }, @ConnectedSocket() client: Socket) {
    console.log(`Завершение звонка для ${data.to}`);

    this.server.to(data.to).emit('call-ended');
  }

  // Отклонение звонка
  @SubscribeMessage('decline-call')
  handleDeclineCall(@MessageBody() data: { to: string }, @ConnectedSocket() client: Socket) {
    console.log(`Отклонение звонка для ${data.to}`);

    this.server.to(data.to).emit('call-declined');
  }
}
