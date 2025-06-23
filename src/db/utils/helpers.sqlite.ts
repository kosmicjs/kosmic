import {type Kysely, sql, type CreateTableBuilder} from 'kysely';

export async function createTimestampTrigger(
  db: Kysely<any>,
  tableName: string,
) {
  return sql`
    CREATE TRIGGER update_${sql.raw(tableName)}_updated_at
    AFTER UPDATE ON ${sql.table(tableName)}
    FOR EACH ROW
    BEGIN
      UPDATE ${sql.table(tableName)}
      SET updated_at = CURRENT_TIMESTAMP
      WHERE id = NEW.id;
    END;
  `.execute(db);
}

export async function dropTimestampTrigger(db: Kysely<any>, tableName: string) {
  return sql`
    DROP TRIGGER IF EXISTS update_${sql.raw(tableName)}_updated_at;
  `.execute(db);
}

export function addTimestampsColumns(ctb: CreateTableBuilder<any, any>) {
  return ctb
    .addColumn('created_at', 'text', (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
    )
    .addColumn('updated_at', 'text', (col) =>
      col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
    );
}

export function addIdColumn(ctb: CreateTableBuilder<any, any>) {
  return ctb.addColumn('id', 'integer', (col) =>
    col.primaryKey().autoIncrement(),
  );
}
