#!/usr/bin/env node
/* eslint-disable no-await-in-loop */

import path from 'node:path';
import fs from 'node:fs/promises';
import {
  type Kysely,
  type Migration,
  type MigrationProvider,
  Migrator,
} from 'kysely';

export type KosmicMigration = Migration & {
  sequence: string;
};

// https://github.com/kysely-org/kysely/issues/277#issuecomment-1385995789
export class ESMFileMigrationProvider implements MigrationProvider {
  constructor(
    private readonly migrationsPath: string,
    private readonly logger?: {
      info: (message: string) => void;
      warn: (message: string) => void;
    },
  ) {}

  async getMigrations(): Promise<Record<string, Migration>> {
    this.logger?.info(`Loading migrations from: ${this.migrationsPath}`);
    let migrations: Record<string, Migration | KosmicMigration> = {};

    const resolvedPath = this.migrationsPath;

    let files: string[] = [];

    try {
      files = await fs.readdir(resolvedPath);
    } catch {
      this.logger?.warn(
        `Migration directory not found: ${resolvedPath}. Please create it.`,
      );
    }

    const standaloneMigrationFile = resolvedPath;

    try {
      await fs.access(standaloneMigrationFile);

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
    } catch {
      this.logger?.warn(
        `No standalone migration file found at ${standaloneMigrationFile}. Looking for individual migration files in the directory instead.`,
      );
      // Standalone migration file doesn't exist, which is fine
    }

    if (Array.isArray(files) && files.length > 0) {
      const jsFiles = files.filter((file) => file.endsWith('.ts'));
      for (const fileName of jsFiles) {
        const importPath = path
          .join(resolvedPath, fileName)
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

export type MigratorOptions = {
  db: Kysely<any>;
  migrationsPath: string;
  allowUnorderedMigrations?: boolean;
  logger?: {warn: (message: string) => void; info: (message: string) => void};
};

export function createMigrator(options: MigratorOptions): Migrator {
  const {db, migrationsPath, allowUnorderedMigrations = true, logger} = options;

  return new Migrator({
    db,
    provider: new ESMFileMigrationProvider(migrationsPath, logger),
    allowUnorderedMigrations,
  });
}
