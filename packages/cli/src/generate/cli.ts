#!/usr/bin/env node
import process from 'node:process';
import {parseArgs} from 'node:util';
import {config} from '@kosmic/config';
import {execa} from 'execa';
import pg from 'pg';

const HELP_TEXT = `
Generate types and schemas from your database for a kosmic application.

Usage
  $ kosmic generate [options]

Options
  --cwd               Working directory (default: process.cwd())
  --help, -h          Show this help message
`.trim();

const cli = parseArgs({
  allowPositionals: true,
  options: {
    cwd: {
      type: 'string',
    },
    help: {
      type: 'boolean',
      short: 'h',
    },
  },
});

if (cli.values.help) {
  console.log(HELP_TEXT);
  process.exit(0);
}

try {
  const cwd = cli.values.cwd ?? process.cwd();
  const $$kosmic = execa({
    cwd: import.meta.dirname,
    stdio: 'inherit',
    preferLocal: true,
  });

  const outfile = `${cwd}/src/db/generated.ts`;
  const client = new pg.Client(config.db?.pg);
  const databaseUrl = new URL(
    config.db?.pg.connectionString ?? 'postgresql://localhost',
  );

  databaseUrl.hostname = client.host;
  databaseUrl.port = String(client.port);
  databaseUrl.pathname = `/${client.database ?? ''}`;
  databaseUrl.username = client.user ?? '';
  databaseUrl.password = client.password ?? '';

  await $$kosmic`kysely-codegen --url=${databaseUrl.href} --out-file=${outfile}`;
} catch {
  // console.error('Error generating types and schemas:', error);
  process.exit(1);
}
