#!/usr/bin/env node
/* eslint-disable no-await-in-loop */

import path from 'node:path';
import fs from 'node:fs/promises';
import {type Migration, type MigrationProvider, Migrator} from 'kysely';
import type {KosmicMigration} from '#db/migrations.js';
import {db} from '#db/index.js';
import logger from '#utils/logger.js';

// https://github.com/kysely-org/kysely/issues/277#issuecomment-1385995789
export class ESMFileMigrationProvider implements MigrationProvider {
  constructor(private readonly relativePath: string) {}

  async getMigrations(): Promise<Record<string, Migration>> {
    let migrations: Record<string, Migration | KosmicMigration> = {};

    const __dirname = import.meta.dirname;
    const resolvedPath = path.resolve(__dirname, this.relativePath);

    let files: string[] = [];

    try {
      files = await fs.readdir(resolvedPath);
    } catch {
      logger.warn(
        `Migration directory not found: ${resolvedPath}. Please create it.`,
      );
    }

    const standaloneMigrationFile = path.resolve(
      __dirname,
      `${this.relativePath}.js`,
    );

    if (standaloneMigrationFile) {
      migrations = (await import(standaloneMigrationFile)) as Record<
        string,
        KosmicMigration
      >;

      migrations = Object.fromEntries(
        Object.entries(migrations).map(([key, value]) => {
          if (!('sequence' in value)) return [key, value];
          const {sequence, ...migration} = value;
          return [`${sequence}_${key}`, migration];
        }),
      );
    }

    if (Array.isArray(files) && files.length > 0) {
      const jsFiles = files.filter((file) => file.endsWith('.js'));
      for (const fileName of jsFiles) {
        const importPath = path
          .join(this.relativePath, fileName)
          .replaceAll('\\', '/');

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
    }

    return migrations;
  }
}

export const migrator = new Migrator({
  db,
  provider: new ESMFileMigrationProvider(
    path.join(import.meta.dirname, '..', 'migrations'),
  ),
  allowUnorderedMigrations: true,
});
