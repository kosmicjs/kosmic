import fs from 'node:fs/promises';
import process from 'node:process';
import {type Kysely, sql} from 'kysely';
import type {Migration} from 'kysely/migration';
import argon2 from 'argon2';
import {logger} from '@kosmic/logger';
import {
  createTimestampTrigger,
  dropTimestampTrigger,
  addTimestampsColumns,
  addIdColumn,
  KosmicMigration,
  addUuidColumn,
} from '@kosmic/db/migrations';
import {generateApiKey} from '../generate-api-key.ts';

/**
 * Create the users table
 */
const usersKyselyMigration: Migration = {
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
          .check(sql`role IN ('admin', 'user')`)
          .defaultTo('user'),
      )
      .addColumn('is_active', 'boolean', (col) => col.notNull().defaultTo(true))
      .addColumn('is_verified', 'boolean', (col) =>
        col.notNull().defaultTo(false),
      )
      .addColumn('verification_token', 'uuid')
      .addColumn('verification_token_expires_at', 'timestamptz')
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

    const hash = await argon2.hash('kosmic');

    await db
      .insertInto('users')
      .values({
        first_name: 'Kosmic',
        last_name: 'Admin',
        email: 'superuser@kosmic.com',
        hash,
        role: 'admin',
      })
      .execute();

    await db.schema
      .createIndex('users_verification_token_idx')
      .ifNotExists()
      .on('users')
      .columns(['verification_token'])
      .execute();

    await db.schema
      .createIndex('users_role_active_idx')
      .ifNotExists()
      .on('users')
      .columns(['role', 'is_active'])
      .execute();

    logger.info('Created table users');
  },
  async down(db: Kysely<any>): Promise<void> {
    logger.debug('Dropping table users...');
    await db.schema.dropTable('users').ifExists().cascade().execute();
    await db.schema.dropIndex('users_email_idx').ifExists().cascade().execute();
    await db.schema
      .dropIndex('users_verification_token_idx')
      .ifExists()
      .execute();
    await db.schema.dropIndex('users_role_active_idx').ifExists().execute();
    await dropTimestampTrigger(db, 'users');
    logger.info('Dropped table users');
  },
};

export class UsersMigration extends KosmicMigration {
  constructor({sequence}: {sequence: string}) {
    super({
      sequence,
      ...usersKyselyMigration,
    });
  }
}

const sessionsKyselyMigration: Migration = {
  async up(db: Kysely<any>): Promise<void> {
    logger.debug('Creating table sessions...');
    await db.schema
      .createTable('sessions')
      .ifNotExists()
      .addColumn('key', 'uuid', (col) =>
        col.primaryKey().defaultTo(sql`uuidv7()`),
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

export class SessionsMigration extends KosmicMigration {
  constructor({sequence}: {sequence: string}) {
    super({
      sequence,
      ...sessionsKyselyMigration,
    });
  }
}

/**
 * Create the api_keys table for OWASP-compliant API key management
 */
const apiKeysKyselyMigration: Migration = {
  async up(db: Kysely<any>): Promise<void> {
    logger.debug('Creating table api_keys...');
    await db.schema
      .createTable('api_keys')
      .ifNotExists()
      .$call(addIdColumn)
      .addColumn('user_id', 'integer', (col) =>
        col.notNull().references('users.id').onDelete('cascade'),
      )
      .addColumn('name', 'text', (col) => col.notNull())
      .addColumn('key_prefix', 'text', (col) => col.notNull())
      .addColumn('key_hash', 'text', (col) => col.notNull())
      .addColumn('last_used_at', 'timestamptz')
      .addColumn('expires_at', 'timestamptz')
      .addColumn('is_active', 'boolean', (col) => col.notNull().defaultTo(true))
      .addColumn('permissions', 'json')
      .$call(addTimestampsColumns)
      .execute();

    await createTimestampTrigger(db, 'api_keys');

    // Create indexes for performance
    await db.schema
      .createIndex('api_keys_user_id_idx')
      .ifNotExists()
      .on('api_keys')
      .columns(['user_id'])
      .execute();

    await db.schema
      .createIndex('api_keys_key_hash_idx')
      .ifNotExists()
      .on('api_keys')
      .columns(['key_hash'])
      .execute();

    await db.schema
      .createIndex('api_keys_key_prefix_idx')
      .ifNotExists()
      .on('api_keys')
      .columns(['key_prefix'])
      .execute();

    const {apiKey, keyPrefix, keyHash} = await generateApiKey();

    if (process.env.KOSMIC_ENV !== 'test') {
      await fs.writeFile(
        `api_key_${new Date().toISOString()}.txt`,
        `Kosmic Admin Key: ${apiKey}`,
      );
    }

    await db
      .insertInto('api_keys')
      .values({
        user_id: 1, // Assuming the admin user has ID 1
        name: 'Kosmic Admin Key',
        key_prefix: keyPrefix,
        key_hash: keyHash,
      })
      .execute();

    logger.info('Created table api_keys');
  },
  async down(db: Kysely<any>): Promise<void> {
    logger.debug('Dropping table api_keys...');
    await db.schema.dropTable('api_keys').ifExists().cascade().execute();
    await db.schema.dropIndex('api_keys_user_id_idx').ifExists().execute();
    await db.schema.dropIndex('api_keys_key_hash_idx').ifExists().execute();
    await db.schema.dropIndex('api_keys_key_prefix_idx').ifExists().execute();
    await dropTimestampTrigger(db, 'api_keys');
    logger.info('Dropped table api_keys');
  },
};

export class ApiKeysMigration extends KosmicMigration {
  constructor({sequence}: {sequence: string}) {
    super({
      sequence,
      ...apiKeysKyselyMigration,
    });
  }
}
