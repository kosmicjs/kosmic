import fs from 'node:fs/promises';
import process from 'node:process';
import {type Kysely, sql, type Migration} from 'kysely';
import argon2 from 'argon2';
import {logger} from '@kosmic/logger';
import {
  createTimestampTrigger,
  dropTimestampTrigger,
  addTimestampsColumns,
  addIdColumn,
} from './helpers.ts';
import * as apiKeysModel from './api-keys.ts';

/**
 * Describes a Kosmic migration with an explicit execution order.
 *
 * Implement this interface for migrations that should be discovered and run by
 * the Kosmic CLI.
 */
export interface KosmicMigration extends Migration {
  /**
   * Ordering token used by migration runners to sort migrations.
   */
  sequence: number | string;
}

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
      .addColumn('is_verified', 'boolean', (col) =>
        col.notNull().defaultTo(false),
      )
      .addColumn('verification_token', 'uuid')
      .addColumn('verification_token_expires_at', 'timestamp')
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
      .addColumn('user_id', 'integer', (col) =>
        col.references('users.id').onDelete('cascade').notNull(),
      )
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
      .addColumn('user_id', 'integer', (col) =>
        col.references('users.id').onDelete('cascade'),
      )
      .addColumn('sent_at', 'timestamp')
      .addColumn('html', 'text')
      .addColumn('to', 'text')
      .addColumn('from', 'text')
      .addColumn('subject', 'text')
      .addColumn('text', 'text')
      .addColumn('attachments', 'text')
      .addColumn('status', 'text', (col) =>
        col
          .notNull()
          .check(sql`status in ('pending', 'sent', 'failed')`)
          .defaultTo('pending'),
      )
      .addColumn('description', 'text')
      .$call(addTimestampsColumns)
      .execute();

    await createTimestampTrigger(db, 'emails');

    await db.schema
      .createIndex('emails_unsent_idx')
      .ifNotExists()
      .on('emails')
      .columns(['sent_at'])
      .where('sent_at', 'is', null)
      .execute();
    logger.info('Created table emails');
  },
  async down(db: Kysely<any>): Promise<void> {
    logger.debug('Dropping table emails...');
    await db.schema.dropTable('emails').ifExists().cascade().execute();
    await db.schema.dropIndex('emails_unsent_idx').ifExists().execute();
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

/**
 * Create the api_keys table for OWASP-compliant API key management
 */
export const apiKeys: KosmicMigration = {
  sequence: '2025-01-06',
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
      .addColumn('last_used_at', 'timestamp')
      .addColumn('expires_at', 'timestamp')
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

    const {apiKey, keyPrefix, keyHash} = await apiKeysModel.generateApiKey();

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
export const auditLog: KosmicMigration = {
  sequence: '2025-01-07',
  async up(db: Kysely<any>): Promise<void> {
    logger.debug('Creating audit_log table...');

    // Create the audit log table
    await db.schema
      .createTable('audit_log')
      .ifNotExists()
      .$call(addIdColumn)
      .addColumn('table_name', 'varchar(50)', (col) => col.notNull())
      .addColumn('record_id', 'text', (col) => col.notNull())
      .addColumn('action', 'varchar(10)', (col) =>
        col.notNull().check(sql`action in ('INSERT', 'UPDATE', 'DELETE')`),
      )
      .addColumn('old_values', 'json')
      .addColumn('new_values', 'json')
      .addColumn('changed_fields', 'text') // Store as comma-separated string
      .addColumn('user_id', 'integer', (col) =>
        col.references('users.id').onDelete('set null'),
      )
      .addColumn('session_id', 'uuid')
      .addColumn('ip_address', 'varchar(45)')
      .addColumn('user_agent', 'text')
      .$call(addTimestampsColumns)
      .execute();

    // Create indexes for performance
    await db.schema
      .createIndex('audit_log_table_record_idx')
      .on('audit_log')
      .columns(['table_name', 'record_id'])
      .execute();

    await db.schema
      .createIndex('audit_log_user_idx')
      .on('audit_log')
      .columns(['user_id'])
      .execute();

    await db.schema
      .createIndex('audit_log_created_at_idx')
      .on('audit_log')
      .columns(['created_at'])
      .execute();

    // Create audit trigger function with correct data types
    await sql`
      CREATE OR REPLACE FUNCTION audit_trigger_function()
      RETURNS TRIGGER AS $$
      DECLARE
        old_data json;
        new_data json;
        changed_fields text;
        current_user_id integer;
        current_session_id text;
        current_ip text;
        current_user_agent text;
      BEGIN
        -- Get context from session variables
        current_user_id := nullif(current_setting('app.current_user_id', true), '')::integer;
        current_session_id := nullif(current_setting('app.session_id', true), '');
        current_ip := nullif(current_setting('app.ip_address', true), '');
        current_user_agent := nullif(current_setting('app.user_agent', true), '');

        IF TG_OP = 'DELETE' THEN
          old_data := to_json(OLD);

          INSERT INTO audit_log (
            table_name, record_id, action, old_values, user_id,
            session_id, ip_address, user_agent
          )
          VALUES (
            TG_TABLE_NAME, OLD.id::text, TG_OP, old_data, current_user_id,
            current_session_id::uuid, current_ip, current_user_agent
          );

          RETURN OLD;

        ELSIF TG_OP = 'INSERT' THEN
          new_data := to_json(NEW);

          INSERT INTO audit_log (
            table_name, record_id, action, new_values, user_id,
            session_id, ip_address, user_agent
          )
          VALUES (
            TG_TABLE_NAME, NEW.id::text, TG_OP, new_data, current_user_id,
            current_session_id::uuid, current_ip, current_user_agent
          );

          RETURN NEW;

        ELSIF TG_OP = 'UPDATE' THEN
          old_data := to_json(OLD);
          new_data := to_json(NEW);

          -- Calculate changed fields as comma-separated string
          SELECT string_agg(old_record.key, ',') INTO changed_fields
          FROM json_each_text(old_data) old_record
          JOIN json_each_text(new_data) new_record ON old_record.key = new_record.key
          WHERE old_record.value IS DISTINCT FROM new_record.value;

          -- Only log if there are actual changes
          IF changed_fields IS NOT NULL AND length(changed_fields) > 0 THEN
            INSERT INTO audit_log (
              table_name, record_id, action, old_values, new_values,
              changed_fields, user_id, session_id, ip_address, user_agent
            )
            VALUES (
              TG_TABLE_NAME, NEW.id::text, TG_OP, old_data, new_data,
              changed_fields, current_user_id, current_session_id::uuid,
              current_ip, current_user_agent
            );
          END IF;

          RETURN NEW;
        END IF;

        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;
    `.execute(db);

    await createTimestampTrigger(db, 'audit_log');
    logger.info('Created audit_log table and trigger function');
  },

  async down(db: Kysely<any>): Promise<void> {
    logger.debug('Dropping audit_log table...');
    await dropTimestampTrigger(db, 'audit_log');
    await sql`DROP FUNCTION IF EXISTS audit_trigger_function() CASCADE`.execute(
      db,
    );
    await db.schema.dropTable('audit_log').ifExists().cascade().execute();
    logger.info('Dropped audit_log table and trigger function');
  },
};

export const addAuditTriggers: KosmicMigration = {
  sequence: '2025-01-08',
  async up(db: Kysely<any>): Promise<void> {
    logger.debug('Adding audit triggers to tables...');

    const tables = ['users', 'entities', 'emails', 'api_keys'];

    for (const table of tables) {
      // eslint-disable-next-line no-await-in-loop
      await sql`
        CREATE TRIGGER audit_trigger_${sql.raw(table)}
        AFTER INSERT OR UPDATE OR DELETE ON ${sql.ref(table)}
        FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
      `.execute(db);
      logger.debug(`Added audit trigger to ${table}`);
    }

    logger.info('Added audit triggers to all tables');
  },

  async down(db: Kysely<any>): Promise<void> {
    logger.debug('Dropping audit triggers...');

    const tables = ['users', 'entities', 'emails', 'api_keys'];

    for (const table of tables) {
      // eslint-disable-next-line no-await-in-loop
      await sql`DROP TRIGGER IF EXISTS audit_trigger_${sql.raw(table)} ON ${sql.ref(table)}`.execute(
        db,
      );
    }

    logger.info('Dropped audit triggers from all tables');
  },
};
