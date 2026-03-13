import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import { OnEvent } from '@nestjs/event-emitter';
import { Subject, Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { Notification } from './entities/notification.entity';
import { User } from '../users/entities/user.entity';
import { NotificationType } from './notification-type.enum';
import { NotificationView } from './interfaces/notification-view.interface';

@Injectable()
export class NotificationsService {
  private streams = new Map<string, Subject<MessageEvent>>();
  private userConnections = new Map<string, Set<string>>();

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: EntityRepository<Notification>,
    @InjectRepository(User)
    private readonly userRepo: EntityRepository<User>,
  ) {}

  async create(recipientId: string, type: string, payload: Record<string, any>): Promise<NotificationView> {
    const recipient = await this.userRepo.findOneOrFail({ id: recipientId });

    const notification = this.notificationRepo.create({
      recipient,
      type,
      payload,
      isRead: false,
      createdAt: new Date(),
    });

    await this.notificationRepo.getEntityManager().persistAndFlush(notification);

    const view: NotificationView = {
      id: notification.id,
      type: notification.type,
      payload: notification.payload,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
    };

    const unreadCount = await this.notificationRepo.count({ recipient: { id: recipientId }, isRead: false });

    this.pushToStream(recipientId, {
      type: 'new_notification',
      notification: view,
      unreadCount,
    });

    return view;
  }

  async getByUser(userId: string): Promise<NotificationView[]> {
    const notifications = await this.notificationRepo.find(
      { recipient: { id: userId } },
      { orderBy: { createdAt: 'DESC' }, limit: 50 },
    );

    return notifications.map((n) => ({
      id: n.id,
      type: n.type,
      payload: n.payload,
      isRead: n.isRead,
      createdAt: n.createdAt,
    }));
  }

  async markAsRead(notificationId: string): Promise<void> {
    const notification = await this.notificationRepo.findOneOrFail({ id: notificationId }, { populate: ['recipient'] });
    notification.isRead = true;
    await this.notificationRepo.getEntityManager().flush();

    const userId = notification.recipient.id;
    const unreadCount = await this.notificationRepo.count({ recipient: { id: userId }, isRead: false });

    this.pushToStream(userId, {
      type: 'notifications_updated',
      notificationId,
      unreadCount,
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    const notifications = await this.notificationRepo.find({
      recipient: { id: userId },
      isRead: false,
    });

    notifications.forEach((n) => (n.isRead = true));
    await this.notificationRepo.getEntityManager().flush();

    this.pushToStream(userId, {
      type: 'notifications_updated',
      unreadCount: 0,
    });
  }

  getStream(userId: string): { connectionId: string; stream: Observable<MessageEvent> } {
    const connectionId = uuidv4();
    const subject = new Subject<MessageEvent>();

    this.streams.set(connectionId, subject);

    if (!this.userConnections.has(userId)) {
      this.userConnections.set(userId, new Set());
    }
    this.userConnections.get(userId)!.add(connectionId);

    return { connectionId, stream: subject.asObservable() };
  }

  removeStream(userId: string, connectionId: string): void {
    const subject = this.streams.get(connectionId);
    if (subject) {
      subject.complete();
      this.streams.delete(connectionId);
    }

    const connections = this.userConnections.get(userId);
    if (connections) {
      connections.delete(connectionId);
      if (connections.size === 0) {
        this.userConnections.delete(userId);
      }
    }
  }

  private pushToStream(userId: string, data: Record<string, any>): void {
    const connectionIds = this.userConnections.get(userId);
    if (!connectionIds) return;

    for (const connectionId of connectionIds) {
      const subject = this.streams.get(connectionId);
      subject?.next({ data } as unknown as MessageEvent);
    }
  }

  @OnEvent('notification.new_message')
  async handleNewMessage(payload: {
    recipientId: string;
    fromUserId: string;
    fromUserName: string;
    messagePreview: string;
    roomId: string;
  }) {
    await this.create(payload.recipientId, NotificationType.NEW_MESSAGE, {
      fromUserId: payload.fromUserId,
      fromUserName: payload.fromUserName,
      messagePreview: payload.messagePreview,
      roomId: payload.roomId,
    });
  }

  @OnEvent('notification.missed_call')
  async handleMissedCall(payload: { recipientId: string; fromUserId: string; fromUserName: string }) {
    await this.create(payload.recipientId, NotificationType.MISSED_CALL, {
      fromUserId: payload.fromUserId,
      fromUserName: payload.fromUserName,
    });
  }
}
