import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { ChatRoom } from './chat-room.entity';
import { User } from '../../users/entities/user.entity';
import { v4 } from 'uuid';

@Entity({ tableName: 'Message' })
export class Message {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @Property()
  content!: string;

  @ManyToOne(() => User, { fieldName: 'userId' })
  user!: User;

  @ManyToOne(() => ChatRoom, { fieldName: 'roomId' })
  room!: ChatRoom;

  @Property({ defaultRaw: 'now()' })
  createdAt!: Date;
}
