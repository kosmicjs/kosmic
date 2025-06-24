import {Kysely} from 'kysely';
import type {Database} from '#models/index.js';
import logger from '#utils/logger.js';
import {dialect} from '#db/dialect.js';

export const db = new Kysely<Database>({
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
