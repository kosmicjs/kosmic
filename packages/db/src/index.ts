import {Kysely, PostgresDialect, type PostgresDialectConfig} from 'kysely';
import pg, {type PoolConfig} from 'pg';
import {createLogger} from '@kosmic/logger';

const logger = createLogger({
  name: 'db',
});

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
      logger.trace('postgres connected');
    });

    pool.on('error', (error) => {
      logger.error(error);
    });

    pool.on('release', () => {
      logger.trace('postgres release');
    });

    pool.on('remove', () => {
      logger.trace('postgres removed');
    });

    pool.on('acquire', () => {
      logger.trace('postgres acquired');
    });

    this.db = new Kysely<Database>({
      dialect,
      log(event) {
        if (event.level === 'error') {
          logger.error({
            err: event.error,
            durationMs: event.queryDurationMillis,
            sql: event.query.sql,
          });
        } else {
          logger.trace({
            msg: 'postgres query executed',
            durationMs: event.queryDurationMillis,
            sql: event.query.sql.replaceAll('"', "'"),
          });
        }
      },
    });
  }
}

export * from 'kysely';
