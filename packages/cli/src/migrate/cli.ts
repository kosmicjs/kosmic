#!/usr/bin/env node

import process from 'node:process';
import path from 'node:path';
import {parseArgs} from 'node:util';
import {NO_MIGRATIONS, type Kysely} from 'kysely';
import {pino, type Logger} from 'pino';
import {createMigrator} from './migrator.ts';

const HELP_TEXT = `
Usage
  $ migrate <command> [options]

Commands
  up       Run all pending migrations (default)
  down     Rollback the last migration
  reset    Rollback all migrations

Options
  --db-module, -d     Path to the module exporting the kysely db instance (required)
  --migrations, -m    Path to the migrations directory (required)
  --help, -h          Show this help message
`.trim();

const logger: Logger = pino({
  name: 'kosmic-migrate',
  level: process.env.LOG_LEVEL ?? 'info',
  transport: {target: 'pino-princess'},
});

type ParsedCliArgs = {
  command: string;
  dbModule: string;
  migrations: string;
};

/**
 * Print help text and terminate the process with the specified exit code.
 *
 * @param exitCode - Process exit code.
 */
function showHelp(exitCode = 2): never {
  console.log(HELP_TEXT);
  process.exit(exitCode);
}

/**
 * Parse CLI args and validate required options.
 *
 * @param argv - Process arguments excluding the node executable and script path.
 * @returns Parsed and validated CLI arguments.
 */
function parseCliArgs(argv: string[]): ParsedCliArgs {
  let values: Record<string, string | boolean | undefined>;
  let positionals: string[];

  try {
    ({values, positionals} = parseArgs({
      args: argv,
      allowPositionals: true,
      strict: false,
      options: {
        'db-module': {
          type: 'string',
          short: 'd',
        },
        migrations: {
          type: 'string',
          short: 'm',
        },
        help: {
          type: 'boolean',
          short: 'h',
        },
      },
    }));
  } catch (error) {
    logger.error(error);
    showHelp(2);
  }

  if (values.help === true) {
    showHelp(0);
  }

  const dbModule = values['db-module'];
  const {migrations} = values;

  if (typeof dbModule !== 'string' || dbModule.length === 0) {
    logger.error('Missing required option: --db-module, -d');
    showHelp(2);
  }

  if (typeof migrations !== 'string' || migrations.length === 0) {
    logger.error('Missing required option: --migrations, -m');
    showHelp(2);
  }

  return {
    command: positionals[0] ?? 'up',
    dbModule,
    migrations,
  };
}

async function loadDb(dbModulePath: string): Promise<Kysely<any>> {
  const resolvedPath = path.resolve(process.cwd(), dbModulePath);
  const module = (await import(resolvedPath)) as {db: Kysely<any>};
  return module.db;
}

async function main() {
  const {command, dbModule, migrations} = parseCliArgs(process.argv.slice(2));

  const db = await loadDb(dbModule);
  const migrationsPath = path.resolve(process.cwd(), migrations);

  const migrator = createMigrator({
    db,
    migrationsPath,
    logger,
  });

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
  showHelp();
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
