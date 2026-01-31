#!/usr/bin/env node

import process from 'node:process';
import path from 'node:path';
import meow from 'meow';
import {NO_MIGRATIONS, type Kysely} from 'kysely';
import {pino, type Logger} from 'pino';
import {createMigrator} from './migrator.ts';

const cli = meow(
  `
  Usage
    $ migrate <command> [options]

  Commands
    up       Run all pending migrations (default)
    down     Rollback the last migration
    reset    Rollback all migrations

  Options
    --db-module, -d     Path to the module exporting the kysely db instance (required)
    --migrations, -m    Path to the migrations directory (required)
    --help              Show this help message
`,
  {
    importMeta: import.meta,
    flags: {
      dbModule: {
        type: 'string',
        shortFlag: 'd',
        isRequired: true,
      },
      migrations: {
        type: 'string',
        shortFlag: 'm',
        isRequired: true,
      },
    },
  },
);

const logger: Logger = pino({
  name: 'kosmic-migrate',
  level: process.env.LOG_LEVEL ?? 'info',
  transport: {target: 'pino-princess'},
});

async function loadDb(dbModulePath: string): Promise<Kysely<any>> {
  const resolvedPath = path.resolve(process.cwd(), dbModulePath);
  const module = (await import(resolvedPath)) as {db: Kysely<any>};
  return module.db;
}

async function main() {
  const {dbModule, migrations} = cli.flags;

  const db = await loadDb(dbModule);
  const migrationsPath = path.resolve(process.cwd(), migrations);

  const migrator = createMigrator({
    db,
    migrationsPath,
    logger,
  });

  const command = cli.input[0] ?? 'up';

  // https://github.com/kysely-org/kysely/issues/277#issuecomment-1385995789
  if (command === 'up') {
    logger.info('Migrating up');
    const {error, results} = await migrator.migrateToLatest();

    if (error) {
      logger.error(error);
      process.exit(1);
    }

    logger.info({results}, 'Migration results:');
    process.exit();
  }

  if (command === 'down') {
    logger.info('Rolling back last migration');
    const {error, results} = await migrator.migrateDown();

    if (error) {
      logger.error(error);
      process.exit(1);
    }

    logger.info({results}, 'Migration results:');
    process.exit();
  }

  if (command === 'reset') {
    logger.info('Resetting Database (rolling back all migrations)');
    const {error, results} = await migrator.migrateTo(NO_MIGRATIONS);

    if (error) {
      logger.error(error);
      process.exit(1);
    }

    logger.info({results}, 'Migration results:');
    process.exit();
  }

  logger.error(`Unknown command: ${command}`);
  cli.showHelp();
}

await main();

process.on('unhandledRejection', (error) => {
  logger.error(error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error(error);
  process.exit(1);
});
