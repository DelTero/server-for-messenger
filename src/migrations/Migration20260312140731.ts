import { Migration } from '@mikro-orm/migrations';

export class Migration20260312140731 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "Notification" ("id" uuid not null, "recipientId" uuid not null, "type" varchar(255) not null, "payload" jsonb not null, "is_read" boolean not null default false, "created_at" timestamptz not null default now(), constraint "Notification_pkey" primary key ("id"));`);

    this.addSql(`alter table "Notification" add constraint "Notification_recipientId_foreign" foreign key ("recipientId") references "User" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "Notification" cascade;`);
  }

}
