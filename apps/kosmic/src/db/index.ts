import {Kysely, PostgresDialect} from 'kysely';
import pkg from 'pg';
import {config} from '@kosmic/config';
import type {Database} from '#models/index.js';
import logger from '#utils/logger.js';

const {Pool} = pkg;

export const pool = new Pool({
  ...config.db?.pg,
});

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

export const dialect = new PostgresDialect({
  pool,
});

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
