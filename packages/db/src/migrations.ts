import {type Kysely, sql} from 'kysely';
import type {Migration} from 'kysely/migration';
import {logger} from '@kosmic/logger';
import {
  createTimestampTrigger,
  dropTimestampTrigger,
  addTimestampsColumns,
  addIdColumn,
} from './helpers.ts';

export * from './helpers.ts';

/**
 * Describes a Kosmic migration with an explicit execution order.
 *
 * Implement this interface for migrations that should be discovered and run by
 * the Kosmic CLI.
 */
export class KosmicMigration implements Migration {
  /**
   * Ordering token used by migration runners to sort migrations.
   */
  sequence: string;
  up: (db: Kysely<any>) => Promise<void>;
  down?: (db: Kysely<any>) => Promise<void>;

  constructor({
    sequence,
    up,
    down,
  }: {
    sequence: string;
    up: (db: Kysely<any>) => Promise<void>;
    down?: (db: Kysely<any>) => Promise<void>;
  }) {
    this.sequence = sequence;
    this.up = up;
    if (down) {
      this.down = down;
    }
  }
}

/**
 * Create a trigger function to update the updated_at column
 * on every update of the table.
 */
const timestampTriggersKyselyMigration: Migration = {
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

export class TriggerMigration extends KosmicMigration {
  constructor({sequence}: {sequence: string}) {
    super({
      sequence,
      ...timestampTriggersKyselyMigration,
    });
  }
}
/**
 * Create the entities table
 */
const entitiesKyselyMigration: Migration = {
  async up(db: Kysely<any>): Promise<void> {
    logger.debug('Creating table entity...');
    await db.schema
      .createTable('entities')
      .ifNotExists()
      .$call(addIdColumn)
      .addColumn('user_id', 'uuid', (col) =>
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

export class EntitiesMigration extends KosmicMigration {
  constructor({sequence}: {sequence: string}) {
    super({
      sequence,
      ...entitiesKyselyMigration,
    });
  }
}

/**
 * Create the emails table
 */
const emailsKyselyMigration: Migration = {
  async up(db: Kysely<any>): Promise<void> {
    logger.debug('Creating table emails...');
    await db.schema
      .createTable('emails')
      .ifNotExists()
      .$call(addIdColumn)
      .addColumn('user_id', 'uuid', (col) =>
        col.references('users.id').onDelete('cascade'),
      )
      .addColumn('sent_at', 'timestamptz')
      .addColumn('html', 'text')
      .addColumn('to', 'text')
      .addColumn('from', 'text')
      .addColumn('subject', 'text')
      .addColumn('text', 'text')
      .addColumn('attachments', 'text')
      .addColumn('status', 'text', (col) =>
        col
          .notNull()
          .check(sql`status IN ('pending', 'sent', 'failed')`)
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

export class EmailsMigration extends KosmicMigration {
  constructor({sequence}: {sequence: string}) {
    super({
      sequence,
      ...emailsKyselyMigration,
    });
  }
}

const auditLogKyselyMigration: Migration = {
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
        col.notNull().check(sql`action IN ('INSERT', 'UPDATE', 'DELETE')`),
      )
      .addColumn('old_values', 'json')
      .addColumn('new_values', 'json')
      .addColumn('changed_fields', 'text') // Store as comma-separated string
      .addColumn('user_id', 'uuid', (col) =>
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
        current_user_id uuid;
        current_session_id text;
        current_ip text;
        current_user_agent text;
      BEGIN
        -- Get context from session variables
        current_user_id := nullif(current_setting('app.current_user_id', true), '')::uuid;
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

export class AuditLogMigration extends KosmicMigration {
  constructor({sequence}: {sequence: string}) {
    super({
      sequence,
      ...auditLogKyselyMigration,
    });
  }
}

const auditTriggersKyselyMigration: Migration = {
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

export class AddAuditTriggersMigration extends KosmicMigration {
  constructor({sequence}: {sequence: string}) {
    super({
      sequence,
      ...auditTriggersKyselyMigration,
    });
  }
}
