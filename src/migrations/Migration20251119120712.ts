import { Migration } from '@mikro-orm/migrations';

export class Migration20251119120712 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "Message" drop constraint "Message_userId_foreign";`);

    this.addSql(`alter table "User" alter column "id" drop default;`);
    this.addSql(`alter table "User" alter column "id" type uuid using ("id"::text::uuid);`);
    this.addSql(`alter table "User" alter column "id" drop default;`);

    this.addSql(`alter table "Message" alter column "userId" drop default;`);
    this.addSql(`alter table "Message" alter column "userId" type uuid using ("userId"::text::uuid);`);
    this.addSql(`alter table "Message" add constraint "Message_userId_foreign" foreign key ("userId") references "User" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "User" alter column "id" type text using ("id"::text);`);

    this.addSql(`alter table "Message" alter column "userId" type text using ("userId"::text);`);

    this.addSql(`alter table "Message" drop constraint "Message_userId_foreign";`);

    this.addSql(`alter table "User" alter column "id" type int using ("id"::int);`);
    this.addSql(`create sequence if not exists "User_id_seq";`);
    this.addSql(`select setval('User_id_seq', (select max("id") from "User"));`);
    this.addSql(`alter table "User" alter column "id" set default nextval('User_id_seq');`);

    this.addSql(`alter table "Message" alter column "userId" type int using ("userId"::int);`);
    this.addSql(`alter table "Message" add constraint "Message_userId_foreign" foreign key ("userId") references "User" ("id") on update cascade;`);
  }

}
