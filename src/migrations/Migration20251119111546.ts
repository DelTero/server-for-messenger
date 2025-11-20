import { Migration } from '@mikro-orm/migrations';

export class Migration20251119111546 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "ChatRoom" ("id" varchar(255) not null, "name" varchar(255) not null, "created_at" timestamptz not null default now(), "is_private" boolean not null default false, constraint "ChatRoom_pkey" primary key ("id"));`);

    this.addSql(`create table "User" ("id" serial primary key, "email" varchar(255) not null, "password" varchar(255) not null, "name" varchar(255) not null, "is_online" boolean not null default false, "last_seen" timestamptz not null default now());`);
    this.addSql(`alter table "User" add constraint "User_email_unique" unique ("email");`);

    this.addSql(`create table "Message" ("id" uuid not null, "content" varchar(255) not null, "userId" int not null, "roomId" varchar(255) not null, "created_at" timestamptz not null default now(), constraint "Message_pkey" primary key ("id"));`);

    this.addSql(`alter table "Message" add constraint "Message_userId_foreign" foreign key ("userId") references "User" ("id") on update cascade;`);
    this.addSql(`alter table "Message" add constraint "Message_roomId_foreign" foreign key ("roomId") references "ChatRoom" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "Message" drop constraint "Message_roomId_foreign";`);

    this.addSql(`alter table "Message" drop constraint "Message_userId_foreign";`);

    this.addSql(`drop table if exists "ChatRoom" cascade;`);

    this.addSql(`drop table if exists "User" cascade;`);

    this.addSql(`drop table if exists "Message" cascade;`);
  }

}
