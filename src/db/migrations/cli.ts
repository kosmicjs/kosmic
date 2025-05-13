#!/usr/bin/env node

import process from 'node:process';
import meow from 'meow';
import {NO_MIGRATIONS} from 'kysely';
import {migrator} from './migrator.js';
import logger from '#utils/logger.js';

const cli = meow(
  `
  Usage
    $ node cli.js <command> [options]
  Commands
    up       Run all pending migrations
    down     Rollback the last migration
    create   Create a new migration
  Options
    --name   Name of the migration file to create
  Examples
    $ node cli.js up
    $ node cli.js down
    $ node cli.js create --name my_migration
`,
  {
    importMeta: import.meta,
    flags: {
      name: {
        type: 'string',
        alias: 'n',
        isRequired: false,
        isMultiple: false,
        default: 'migration',
      },
    },
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
  logger.info('Migrating down');
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
