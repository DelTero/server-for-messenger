import { Collection, Entity, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { Message } from './message.entity';

@Entity({ tableName: 'ChatRoom' })
export class ChatRoom {
  @PrimaryKey()
  id!: string;

  @Property()
  name!: string;

  @Property({ defaultRaw: 'now()' })
  createdAt!: Date;

  @Property({ default: false })
  isPrivate: boolean = false;

  @OneToMany(() => Message, (message) => message.room)
  messages = new Collection<Message>(this);
}
