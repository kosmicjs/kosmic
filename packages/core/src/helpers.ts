import {
  type Migration,
  type Kysely,
  sql,
  type CreateTableBuilder,
} from 'kysely';

/**
 * Creates a per-table trigger that updates the `updated_at` column before each
 * row update.
 *
 * @param db - Active Kysely database connection.
 * @param tableName - Database table name to attach the trigger to.
 * @returns Result of the trigger creation statement execution.
 */
export async function createTimestampTrigger(
  db: Kysely<any>,
  tableName: string,
) {
  return sql`
    CREATE TRIGGER update_${sql.raw(tableName)}_updated_at
    BEFORE UPDATE ON ${sql.table(tableName)}
    FOR EACH ROW
    EXECUTE PROCEDURE update_timestamp();
  `.execute(db);
}

/**
 * Drops the per-table `updated_at` trigger if it exists.
 *
 * @param db - Active Kysely database connection.
 * @param tableName - Database table name whose trigger should be removed.
 * @returns Result of the trigger drop statement execution.
 */
export async function dropTimestampTrigger(db: Kysely<any>, tableName: string) {
  return sql`
    DROP TRIGGER IF EXISTS update_${sql.raw(tableName)}_updated_at ON ${sql.table(tableName)};
  `.execute(db);
}

/**
 * Adds standard audit timestamps to a table definition.
 *
 * Both columns are non-null and default to `CURRENT_TIMESTAMP`.
 *
 * @param ctb - Kysely create-table builder to extend.
 * @returns The same builder with `created_at` and `updated_at` columns added.
 */
export function addTimestampsColumns(ctb: CreateTableBuilder<any, any>) {
  return ctb
    .addColumn('created_at', 'timestamp', (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
    );
}

/**
 * Adds a generated integer primary key `id` column to a table definition.
 *
 * @param ctb - Kysely create-table builder to extend.
 * @returns The same builder with an identity `id` primary key column.
 */
export function addIdColumn(ctb: CreateTableBuilder<any, any>) {
  return ctb.addColumn('id', 'integer', (col) =>
    col.primaryKey().generatedAlwaysAsIdentity(),
  );
}
