import {type Kysely, type Migration} from 'kysely';
import logger from '../../utils/logger.js';

export const users: Migration = {
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
    await db.schema.dropTable('users').cascade().execute();
    logger.info('Dropped table users');
  },
};

export const entities: Migration = {
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
    await db.schema.dropTable('entity').cascade().execute();
    logger.info('Dropped table entity');
  },
};

export const emails: Migration = {
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
      .addColumn('status', 'varchar')
      .addColumn('description', 'varchar')
      .addColumn('created_at', 'timestamp')
      .addColumn('updated_at', 'timestamp')
      .execute();
    logger.info('Created table emails');
  },
  async down(db: Kysely<any>): Promise<void> {
    logger.debug('Dropping table emails...');
    await db.schema.dropTable('emails').cascade().execute();
    logger.info('Dropped table emails');
  },
};
