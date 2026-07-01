#!/usr/bin/env node

import process from 'node:process';
import path from 'node:path';
import fs from 'node:fs/promises';
import {parseArgs} from 'node:util';
import {execa} from 'execa';

const HELP_TEXT = `
Build command for kosmic applications.

Usage
  $ kosmic build

Options
  --ts-only           Only compile TypeScript files
  --help, -h          Show this help message
`.trim();

const cli = parseArgs({
  allowPositionals: true,
  options: {
    cwd: {
      type: 'string',
    },
    tsOnly: {
      type: 'boolean',
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
  const $$ = execa({cwd, stdio: 'inherit'});

  // clean
  console.log('rm -rf dist');
  await fs.rm(path.resolve(cwd, 'dist'), {recursive: true, force: true});

  // compile:tsc
  console.log('tsc -p tsconfig.json');
  await $$`tsc --build tsconfig.json`;

  // compile:vite
  if (!cli.values.tsOnly) {
    console.log('vite build');
    await $$`vite build`;
  }

  // compile:cp
  console.log('cp -r dist/src/public src/public');
  await fs.cp(
    path.resolve(cwd, 'dist', 'src', 'public'),
    path.resolve(cwd, 'src', 'public'),
    {recursive: true},
  );
} catch {
  process.exit(1);
}
