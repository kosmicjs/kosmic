import {Kysely, PostgresDialect, type PostgresDialectConfig} from 'kysely';
import pg, {type PoolConfig} from 'pg';
import {getLogger} from '@kosmic/logger';

const {Pool} = pg;

export class KosmicDB<Database = Record<string, unknown>> {
  db: Kysely<Database>;
  pool: pg.Pool;
  dialect: PostgresDialect;
  constructor(config: {
    dialectConfig?: PostgresDialectConfig | undefined;
    poolConfig?: PoolConfig | undefined;
  }) {
    const pool = new Pool({
      ...config.poolConfig,
    });

    this.pool = pool;

    const dialect = new PostgresDialect({
      pool,
    });

    this.dialect = dialect;

    pool.on('connect', () => {
      const logger = getLogger();
      logger?.trace('postgres connected');
    });

    pool.on('error', (error) => {
      const logger = getLogger();
      logger?.error(error);
    });

    pool.on('release', () => {
      const logger = getLogger();
      logger?.trace('postgres release');
    });

    pool.on('remove', () => {
      const logger = getLogger();
      logger?.trace('postgres removed');
    });

    pool.on('acquire', () => {
      const logger = getLogger();
      logger?.trace('postgres acquired');
    });

    this.db = new Kysely<Database>({
      dialect,
      log(event) {
        const logger = getLogger();
        if (event.level === 'error') {
          logger?.error({
            err: event.error,
            durationMs: event.queryDurationMillis,
            sql: event.query.sql,
          });
        } else {
          logger?.trace({
            msg: 'postgres query executed',
            durationMs: event.queryDurationMillis,
            sql: event.query.sql.replaceAll('"', "'"),
          });
        }
      },
    });
  }
}

export * from 'kysely/migration';
// @ts-expect-error whjatas;lasf;laksf;lks
export * from 'kysely';
