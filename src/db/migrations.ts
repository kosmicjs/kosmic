import {type Kysely, type Migration, sql} from 'kysely';
import argon2 from 'argon2';
import {
  createTimestampTrigger,
  dropTimestampTrigger,
  addTimestampsColumns,
  addIdColumn,
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
      .$call(addIdColumn)
      .addColumn('email', 'text', (col) => col.notNull().unique())
      .addColumn('hash', 'text', (col) => col.notNull())
      .addColumn('role', 'text', (col) =>
        col
          .notNull()
          .check(sql`role in ('admin', 'user')`)
          .defaultTo('user'),
      )
      .addColumn('is_active', 'boolean', (col) => col.notNull().defaultTo(true))
      .addColumn('email_verified', 'boolean', (col) =>
        col.defaultTo(sql`false`),
      )
      .addColumn('name', 'text')
      .addColumn('image', 'text')
      .addColumn('first_name', 'text')
      .addColumn('last_name', 'text')
      .addColumn('phone', 'text')
      .$call(addTimestampsColumns)
      .execute();

    await createTimestampTrigger(db, 'users');

    await db.schema
      .createIndex('users_email_idx')
      .ifNotExists()
      .on('users')
      .columns(['email'])
      .execute();

    await db
      .insertInto('users')
      .values({
        first_name: 'Kosmic',
        last_name: 'Admin',
        email: 'superuser@kosmic.com',
        hash: await argon2.hash('kosmic'),
        role: 'admin',
      })
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
      .$call(addIdColumn)
      .addColumn('user_id', 'integer', (col) => col.references('users.id'))
      .addColumn('name', 'text')
      .addColumn('description', 'text')
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
      .$call(addIdColumn)
      .addColumn('user_id', 'integer', (col) => col.references('users.id'))
      .addColumn('sent_at', 'text')
      .addColumn('html', 'text')
      .addColumn('to', 'text')
      .addColumn('from', 'text')
      .addColumn('subject', 'text')
      .addColumn('text', 'text')
      .addColumn('attachments', 'text')
      .addColumn('status', 'text', (col) =>
        col.notNull().check(sql`status in ('pending', 'sent', 'failed')`),
      )
      .addColumn('description', 'text')
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

export const sessions: KosmicMigration = {
  sequence: '2025-01-05',
  async up(db: Kysely<any>): Promise<void> {
    logger.debug('Creating table sessions...');
    await db.schema
      .createTable('sessions')
      .ifNotExists()
      .ifNotExists()
      .$call(addIdColumn)
      .$call(addTimestampsColumns)
      .addColumn('user_id', 'integer', (col) =>
        col.references('users.id').notNull(),
      )
      // token column
      .addColumn('token', 'text', (col) => col.notNull().unique())
      .addColumn('expires_at', 'timestamp', (col) => col.notNull())
      .addColumn('ip_address', 'text')
      .addColumn('user_agent', 'text')
      .execute();

    logger.info('Created table sessions');
  },
  async down(db: Kysely<any>): Promise<void> {
    logger.debug('Dropping table sessions...');
    await db.schema.dropTable('sessions').ifExists().execute();
    logger.info('Dropped table sessions');
  },
};

export const account: KosmicMigration = {
  sequence: '2025-01-06',
  async up(db: Kysely<any>): Promise<void> {
    logger.debug('Creating table accounts...');
    await db.schema
      .createTable('accounts')
      .ifNotExists()
      .$call(addIdColumn)
      .$call(addTimestampsColumns)
      .addColumn('user_id', 'integer', (col) =>
        col.references('users.id').notNull(),
      )
      .addColumn('account_id', 'text', (col) => col.notNull())
      .addColumn('provider_id', 'text', (col) => col.notNull())
      .addColumn('access_token', 'text')
      .addColumn('refresh_token', 'text')
      .addColumn('access_token_expires_at', 'timestamp')
      .addColumn('refresh_token_expires_at', 'timestamp')
      .addColumn('scope', 'text')
      .addColumn('id_token', 'text')
      .addColumn('password', 'text')
      .execute();

    logger.info('Created table accounts');
  },
  async down(db: Kysely<any>): Promise<void> {
    logger.debug('Dropping table accounts...');
    await db.schema.dropTable('accounts').ifExists().execute();
    logger.info('Dropped table accounts');
  },
};

export const verification: KosmicMigration = {
  sequence: '2025-01-07',
  async up(db: Kysely<any>): Promise<void> {
    logger.debug('Creating table verification...');
    await db.schema
      .createTable('verification')
      .ifNotExists()
      .$call(addIdColumn)
      .$call(addTimestampsColumns)
      .addColumn('identifier', 'text', (col) => col.notNull())
      .addColumn('value', 'text', (col) => col.notNull())
      .addColumn('expires_at', 'timestamp', (col) => col.notNull())
      .execute();

    logger.info('Created table verification');
  },
  async down(db: Kysely<any>): Promise<void> {
    logger.debug('Dropping table verification...');
    await db.schema.dropTable('verification').ifExists().execute();
    logger.info('Dropped table verification');
  },
};
