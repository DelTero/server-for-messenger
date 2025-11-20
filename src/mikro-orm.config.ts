import 'dotenv/config';
import { defineConfig } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { Migrator } from '@mikro-orm/migrations';

export default defineConfig({
  clientUrl: process.env.DATABASE_URL ?? '',
  metadataProvider: TsMorphMetadataProvider,

  extensions: [Migrator],

  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts'],

  debug: process.env.NODE_ENV !== 'production',
  allowGlobalContext: true,

  migrations: {
    tableName: 'mikro_orm_migrations',
    path: 'src/migrations',
    glob: '!(*.d).{ts,js}',
    snapshot: true,
  },
});
