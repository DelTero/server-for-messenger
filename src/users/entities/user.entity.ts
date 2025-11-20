import { Collection, Entity, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { Message } from '../../chat/entities/message.entity';
import { v4 } from 'uuid';

@Entity({ tableName: 'User' })
export class User {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @Property({ unique: true })
  email!: string;

  @Property()
  password!: string;

  @Property()
  name!: string;

  @Property({ default: false })
  isOnline: boolean = false;

  @Property({ defaultRaw: 'now()' })
  lastSeen!: Date;

  @OneToMany(() => Message, (m: Message) => m.user)
  messages = new Collection<Message>(this);
}
