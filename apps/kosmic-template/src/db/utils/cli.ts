#!/usr/bin/env node

import process from 'node:process';
import meow from 'meow';
import {NO_MIGRATIONS} from 'kysely';
import {migrator} from './migrator.js';
import logger from '#utils/logger.js';

const cli = meow(
  `
  Usage
    $ npm run migrate <command> [options]
  Flags
    up       Run all pending migrations
    down     Rollback the last migration
    reset    Rollback all migrations
`,
  {
    importMeta: import.meta,
  },
);

// https://github.com/kysely-org/kysely/issues/277#issuecomment-1385995789
if (cli.input.length === 0 || cli.input.includes('up')) {
  logger.info('Migrating up');
  const {error, results} = await migrator.migrateToLatest();

  if (error) {
    logger.error(error);
    process.exit(1);
  }

  logger.info({results}, 'Migration results:');
  process.exit();
}

if (cli.input.includes('down')) {
  logger.info('Rolling back last migration');
  const {error, results} = await migrator.migrateDown();

  if (error) {
    logger.error(error);
    process.exit(1);
  }

  logger.info({results}, 'Migration results:');
  process.exit();
}

if (cli.input.includes('reset')) {
  logger.info('Resetting Database (rolling back all migrations)');
  const {error, results} = await migrator.migrateTo(NO_MIGRATIONS);

  if (error) {
    logger.error(error);
    process.exit(1);
  }

  logger.info({results}, 'Migration results:');
  process.exit();
}

process.on('unhandledRejection', (error) => {
  logger.error(error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error(error);
  process.exit(1);
});
