import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { User } from '../../users/entities/user.entity';
import { v4 } from 'uuid';

@Entity({ tableName: 'Notification' })
export class Notification {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @ManyToOne(() => User, { fieldName: 'recipientId' })
  recipient!: User;

  @Property()
  type!: string;

  @Property({ type: 'json' })
  payload!: Record<string, any>;

  @Property({ default: false })
  isRead: boolean = false;

  @Property({ defaultRaw: 'now()' })
  createdAt!: Date;
}
