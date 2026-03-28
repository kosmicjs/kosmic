#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {parseArgs} from 'node:util';
import {execa} from 'execa';

const HELP_TEXT = `
Compile and run application tests.

Usage
  $ kosmic test [options]

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

const cwd = cli.values.cwd ?? process.cwd();
const $$ = execa({cwd, stdio: 'inherit'});

await fs.rm(path.resolve(cwd, 'dist'), {recursive: true, force: true});
await $$`tsc -p tsconfig.json`;
await $$({
  env: {...process.env, NODE_ENV: 'test', KOSMIC_ENV: 'test'},
})`node --test ${path.join('dist', 'test', 'server.test.js')}`;
