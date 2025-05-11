import {type Kysely, type Migration, sql} from 'kysely';
import logger from '../../utils/logger.js';

export type KosmicMigration = Migration & {
  sequence: number;
};

export const users: KosmicMigration = {
  sequence: 1,
  async up(db: Kysely<any>): Promise<void> {
    logger.debug('Creating table users...');

    await db.schema
      .createTable('users')
      .ifNotExists()
      .addColumn('id', 'serial', (col) => col.primaryKey().notNull())
      .addColumn('first_name', 'varchar')
      .addColumn('last_name', 'varchar')
      .addColumn('phone', 'varchar')
      .addColumn('email', 'varchar')
      .addColumn('hash', 'varchar', (col) => col.notNull())
      .addColumn('created_at', 'timestamp')
      .addColumn('updated_at', 'timestamp')
      .addColumn('google_refresh_token', 'varchar')
      .addColumn('google_access_token', 'varchar')
      .execute();

    logger.info('Created table users');
  },
  async down(db: Kysely<any>): Promise<void> {
    logger.debug('Dropping table users...');
    await db.schema.dropTable('users').ifExists().cascade().execute();
    logger.info('Dropped table users');
  },
};

export const entities: KosmicMigration = {
  sequence: 2,
  async up(db: Kysely<any>): Promise<void> {
    logger.debug('Creating table entity...');
    await db.schema
      .createTable('entities')
      .ifNotExists()
      .addColumn('id', 'serial', (col) => col.primaryKey())
      .addColumn('user_id', 'integer', (col) => col.references('users.id'))
      .addColumn('name', 'varchar')
      .addColumn('description', 'varchar')
      .addColumn('created_at', 'timestamp')
      .addColumn('updated_at', 'timestamp')
      .execute();
    logger.info('Created table entity');
  },
  async down(db: Kysely<any>): Promise<void> {
    logger.debug('Dropping table entity...');
    await db.schema.dropTable('entities').ifExists().cascade().execute();
    logger.info('Dropped table entity');
  },
};

export const emails: KosmicMigration = {
  sequence: 3,
  async up(db: Kysely<any>): Promise<void> {
    logger.debug('Creating table emails...');
    await db.schema
      .createTable('emails')
      .ifNotExists()
      .addColumn('id', 'serial', (col) => col.primaryKey())
      .addColumn('user_id', 'integer', (col) => col.references('users.id'))
      .addColumn('sent_at', 'varchar')
      .addColumn('html', 'varchar')
      .addColumn('to', 'varchar')
      .addColumn('from', 'varchar')
      .addColumn('subject', 'varchar')
      .addColumn('text', 'varchar')
      .addColumn('attachments', 'varchar')
      .addColumn('status', 'varchar', (col) =>
        col.notNull().check(sql`status in ('pending', 'sent', 'failed')`),
      )
      .addColumn('description', 'varchar')
      .addColumn('created_at', 'timestamp')
      .addColumn('updated_at', 'timestamp')
      .execute();
    logger.info('Created table emails');
  },
  async down(db: Kysely<any>): Promise<void> {
    logger.debug('Dropping table emails...');
    await db.schema.dropTable('emails').ifExists().cascade().execute();
    logger.info('Dropped table emails');
  },
};

export const rateLimitAbuse: KosmicMigration = {
  sequence: 4,
  async up(db: Kysely<any>): Promise<void> {
    logger.debug('Creating table rate_limit_abuse...');
    await db.schema
      .createTable('rate_limit_abuse')
      .ifNotExists()
      .addColumn('id', 'serial', (col) => col.primaryKey())
      .addColumn('key', 'varchar')
      .addColumn('prefix', 'varchar')
      .addColumn('nb_max', 'integer')
      .addColumn('nb_hit', 'integer')
      .addColumn('interval', 'varchar')
      .addColumn('ip', 'varchar')
      .addColumn('user_id', 'integer', (col) => col.references('users.id'))
      .addColumn('date_end', 'timestamp', (col) => col.notNull())
      .addColumn('created_at', 'timestamp')
      .addColumn('updated_at', 'timestamp')
      .execute();
    // Add a unique index on key and date_end columns
    await db.schema
      .createIndex('rate_limit_abuse_key_date_end_unique_idx')
      .ifNotExists()
      .on('rate_limit_abuse')
      .columns(['key', 'date_end'])
      .unique()
      .execute();
    logger.info('Created table rate_limit_abuse');
  },
  async down(db: Kysely<any>): Promise<void> {
    logger.debug('Dropping table rate_limit_abuse...');
    // Drop the index first (though it will be dropped automatically with the table in most databases)
    await db.schema
      .dropIndex('rate_limit_abuse_key_date_end_unique_idx')
      .ifExists()
      .execute();
    await db.schema.dropTable('rate_limit_abuse').ifExists().execute();
    logger.info('Dropped table rate_limit_abuse');
  },
};

export const rateLimiter: KosmicMigration = {
  sequence: 5,
  async up(db: Kysely<any>): Promise<void> {
    logger.debug('Creating table rate_limiters...');
    await db.schema
      .createTable('rate_limiters')
      .ifNotExists()
      .addColumn('key', 'varchar(255)', (col) => col.notNull().primaryKey())
      .addColumn('counter', 'integer', (col) => col.notNull().defaultTo(0))
      .addColumn('date_end', 'timestamp', (col) => col.notNull())
      .addColumn('created_at', 'timestamp', (col) => col.notNull())
      .addColumn('updated_at', 'timestamp', (col) => col.notNull())
      .execute();
    // Add indexes
    // The unique index on 'key' is already created implicitly by the primary key
    await db.schema
      .createIndex('rate_limiter_date_end_idx')
      .ifNotExists()
      .on('rate_limiters')
      .columns(['date_end'])
      .execute();
    logger.info('Created table rate_limiters');
  },

  async down(db: Kysely<any>): Promise<void> {
    logger.debug('Dropping table rate_limiter...');
    await db.schema.dropIndex('rate_limiter_date_end_idx').ifExists().execute();
    await db.schema.dropTable('rate_limiters').ifExists().execute();
    logger.info('Dropped table rate_limiter');
  },
};
