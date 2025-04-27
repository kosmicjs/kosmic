#!/usr/bin/env node
/* eslint-disable no-await-in-loop */

import path from 'node:path';
import process from 'node:process';
import fs from 'node:fs/promises';
import {type Migration, type MigrationProvider, Migrator} from 'kysely';
import logger from '../utils/logger.js';
import {db} from './index.js';

// https://github.com/kysely-org/kysely/issues/277#issuecomment-1385995789
class ESMFileMigrationProvider implements MigrationProvider {
  constructor(private readonly relativePath: string) {}

  async getMigrations(): Promise<Record<string, Migration>> {
    let migrations: Record<string, Migration> = {};
    const __dirname = import.meta.dirname;
    const resolvedPath = path.resolve(__dirname, this.relativePath);
    const files = await fs.readdir(resolvedPath);

    const jsFiles = files.filter((file) => file.endsWith('.js'));

    for (const fileName of jsFiles) {
      const importPath = path
        .join(this.relativePath, fileName)
        .replaceAll('\\', '/');

      if (importPath.includes('base-db-setup.js')) {
        migrations = (await import(importPath)) as Record<string, Migration>;
        continue;
      }

      const migration = (await import(importPath)) as {
        up: () => Promise<void>;
        down: () => Promise<void>;
      };

      const migrationKey = fileName.slice(
        0,
        Math.max(0, fileName.lastIndexOf('.')),
      );

      migrations[migrationKey] = migration;
    }

    return migrations;
  }
}

const migrator = new Migrator({
  db,
  provider: new ESMFileMigrationProvider(
    path.join(import.meta.dirname, 'migrations'),
  ),
});

if (process.argv[2] === 'up') {
  logger.info('Migrating up');
  const {error, results} = await migrator.migrateToLatest();

  if (error) {
    logger.error(error);
    process.exit(1);
  }

  logger.info({results}, 'Migration results:');
  process.exit();
}

if (process.argv[2] === 'down') {
  logger.info('Migrating down');
  const {error, results} = await migrator.migrateDown();

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
