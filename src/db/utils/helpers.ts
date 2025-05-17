import {type Kysely, sql, type CreateTableBuilder} from 'kysely';

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

export async function dropTimestampTrigger(db: Kysely<any>, tableName: string) {
  return sql`
    DROP TRIGGER IF EXISTS update_${sql.raw(tableName)}_updated_at ON ${sql.table(tableName)};
  `.execute(db);
}

export function addTimestampsColumns(ctb: CreateTableBuilder<any, any>) {
  return ctb
    .addColumn('created_at', 'timestamp', (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
    );
}

export function addIdColumn(ctb: CreateTableBuilder<any, any>) {
  return ctb.addColumn('id', 'integer', (col) =>
    col.primaryKey().generatedAlwaysAsIdentity(),
  );
}
