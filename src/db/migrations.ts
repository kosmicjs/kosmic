import {type Kysely, type Migration, sql} from 'kysely';
import {
  createTimestampTrigger,
  dropTimestampTrigger,
  addTimestampsColumns,
} from './utils/helpers.js';
import logger from '#utils/logger.js';

export type KosmicMigration = Migration & {
  sequence: string;
};

/**
 * Create a trigger function to update the updated_at column
 * on every update of the table.
 */
export const triggers: KosmicMigration = {
  sequence: '2025-01-01',
  async up(db: Kysely<any>): Promise<void> {
    logger.debug('Creating trigger function update_timestamp...');
    await sql`
      CREATE OR REPLACE FUNCTION update_timestamp()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
  `.execute(db);
    logger.info('Created trigger function update_timestamp');
  },

  async down(db: Kysely<any>): Promise<void> {
    logger.debug('Dropping trigger function update_timestamp...');
    await sql`DROP FUNCTION IF EXISTS update_timestamp() CASCADE`.execute(db);
    logger.info('Dropped trigger function update_timestamp');
  },
};

/**
 * Create the users table
 */
export const users: KosmicMigration = {
  sequence: '2025-01-02',
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
      .addColumn('google_refresh_token', 'varchar')
      .addColumn('google_access_token', 'varchar')
      .$call(addTimestampsColumns)
      .execute();

    await createTimestampTrigger(db, 'users');

    await db.schema
      .createIndex('users_email_idx')
      .ifNotExists()
      .on('users')
      .columns(['email'])
      .execute();

    logger.info('Created table users');
  },
  async down(db: Kysely<any>): Promise<void> {
    logger.debug('Dropping table users...');
    await db.schema.dropTable('users').ifExists().cascade().execute();
    await db.schema.dropIndex('users_email_idx').ifExists().cascade().execute();
    await dropTimestampTrigger(db, 'users');
    logger.info('Dropped table users');
  },
};

/**
 * Create the entities table
 */
export const entities: KosmicMigration = {
  sequence: '2025-01-03',
  async up(db: Kysely<any>): Promise<void> {
    logger.debug('Creating table entity...');
    await db.schema
      .createTable('entities')
      .ifNotExists()
      .addColumn('id', 'serial', (col) => col.primaryKey())
      .addColumn('user_id', 'integer', (col) => col.references('users.id'))
      .addColumn('name', 'varchar')
      .addColumn('description', 'varchar')
      .$call(addTimestampsColumns)
      .execute();

    await createTimestampTrigger(db, 'entities');
    logger.info('Created table entity');
  },
  async down(db: Kysely<any>): Promise<void> {
    logger.debug('Dropping table entity...');
    await db.schema.dropTable('entities').ifExists().cascade().execute();
    await dropTimestampTrigger(db, 'entities');
    logger.info('Dropped table entity');
  },
};

/**
 * Create the emails table
 */
export const emails: KosmicMigration = {
  sequence: '2025-01-04',
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
      .$call(addTimestampsColumns)
      .execute();

    await createTimestampTrigger(db, 'emails');
    logger.info('Created table emails');
  },
  async down(db: Kysely<any>): Promise<void> {
    logger.debug('Dropping table emails...');
    await db.schema.dropTable('emails').ifExists().cascade().execute();
    await dropTimestampTrigger(db, 'emails');
    logger.info('Dropped table emails');
  },
};

/**
 * Create the rate_limit_abuse table
 */
export const rateLimitAbuse: KosmicMigration = {
  sequence: '2025-01-05',
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
      .$call(addTimestampsColumns)
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

/**
 * Create the rate_limiters table
 */
export const rateLimiter: KosmicMigration = {
  sequence: '2025-01-06',
  async up(db: Kysely<any>): Promise<void> {
    logger.debug('Creating table rate_limiters...');
    await db.schema
      .createTable('rate_limiters')
      .ifNotExists()
      .addColumn('key', 'varchar(255)', (col) => col.notNull().primaryKey())
      .addColumn('counter', 'integer', (col) => col.notNull().defaultTo(0))
      .addColumn('date_end', 'timestamp', (col) => col.notNull())
      .$call(addTimestampsColumns)
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

export const sessions: KosmicMigration = {
  sequence: '2025-01-07',
  async up(db: Kysely<any>): Promise<void> {
    logger.debug('Creating table sessions...');
    await db.schema
      .createTable('sessions')
      .ifNotExists()
      .addColumn('key', 'uuid', (col) =>
        col
          .notNull()
          .primaryKey()
          .defaultTo(sql`gen_random_uuid()`),
      )
      .addColumn('value', 'json')
      .execute();

    logger.info('Created table sessions');
  },
  async down(db: Kysely<any>): Promise<void> {
    logger.debug('Dropping table sessions...');
    await db.schema.dropTable('sessions').ifExists().execute();
    logger.info('Dropped table sessions');
  },
};
