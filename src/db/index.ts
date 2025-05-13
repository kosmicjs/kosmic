import {Kysely, PostgresDialect} from 'kysely';
import type {Database} from '../models/index.js';
import logger from '../utils/logger.js';
import {pool} from './pool.js';

export const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool,
  }),
  log(event) {
    if (event.level === 'error') {
      logger.error({
        err: event.error,
        durationMs: event.queryDurationMillis,
        sql: event.query.sql,
      });
    } else {
      logger.debug({
        msg: 'postgres query executed',
        durationMs: event.queryDurationMillis,
        sql: event.query.sql.replaceAll('"', "'"),
      });
    }
  },
});
