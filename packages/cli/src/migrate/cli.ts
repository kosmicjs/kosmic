#!/usr/bin/env node

import fs from 'node:fs/promises';
import process from 'node:process';
import path from 'node:path';
import {parseArgs} from 'node:util';
import {execa} from 'execa';
import {NO_MIGRATIONS, type Kysely} from 'kysely';
import {pino} from 'pino';
import {createMigrator} from './migrator.ts';

const HELP_TEXT = `
Usage
  $ migrate <command> [options]

Commands
  up       Run all pending migrations (default)
  down     Rollback the last migration
  reset    Rollback all migrations

Options
  --db, -d     Path to the module exporting the kysely db instance, resolved from the cwd argument
  --migrations, -m    Path to the migrations directory, resolved from the cwd argument
  --cwd               The working directory to resolve the db-module and migrations paths from (default: process.cwd())
  This command cleans dist and runs tsc --build before executing migrations.
  --help, -h          Show this help message
`.trim();

const logger = pino({
  name: 'kosmic-migrate',
  level: process.env.LOG_LEVEL ?? 'info',
  transport: {target: 'pino-princess'},
});

process.on('unhandledRejection', (error) => {
  logger.error(error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error(error);
  process.exit(1);
});

const cli = parseArgs({
  allowPositionals: true,
  options: {
    db: {
      type: 'string',
      short: 'd',
    },
    migrations: {
      type: 'string',
      short: 'm',
    },
    cwd: {
      type: 'string',
    },
    help: {
      type: 'boolean',
      short: 'h',
    },
  },
});

if (cli.values.help === true) {
  console.log(HELP_TEXT);
  process.exit(0);
}

const cwd = cli.values.cwd ?? process.cwd();

const fullDbModulePath = path.resolve(
  cwd,
  cli.values.db ?? path.join('src', 'db', 'index.ts'),
);
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const dbModule = (await import(fullDbModulePath)) as {db: Kysely<any>};

const migrationsPath = path.resolve(
  cwd,
  cli.values.migrations ?? path.join('src', 'db', 'migrations'),
);

const migrator = createMigrator({
  db: dbModule.db,
  migrationsPath,
  logger,
});

const command = cli.positionals[0] ?? 'up';

switch (command) {
  case 'up': {
    logger.info('Migrating up');
    const {error, results} = await migrator.migrateToLatest();

    if (error) {
      logger.error(error);
      process.exit(1);
    }

    logger.info({results}, 'Migration results:');
    break;
  }

  case 'down': {
    logger.info('Rolling back last migration');
    const {error, results} = await migrator.migrateDown();

    if (error) {
      logger.error(error);
      process.exit(1);
    }

    logger.info({results}, 'Migration results:');
    break;
  }

  case 'reset': {
    logger.info('Resetting Database (rolling back all migrations)');
    const {error, results} = await migrator.migrateTo(NO_MIGRATIONS);

    if (error) {
      logger.error(error);
      process.exit(1);
    }

    logger.info({results}, 'Migration results:');
    break;
  }

  default: {
    logger.error(`Unknown command: ${command}`);
    console.log(HELP_TEXT);
    process.exit(1);
  }
}

process.exit();
