#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {parseArgs} from 'node:util';
import {execa} from 'execa';
import pWaitFor from 'p-wait-for';
import {pathExists} from 'path-exists';

const HELP_TEXT = `
Watch, compile, and rerun tests.

Usage
  $ kosmic test-watch [options]

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

const tscWatch = $$`tsc -p tsconfig.json --watch`;

await pWaitFor(async () =>
  pathExists(path.join('dist', 'test', 'server.test.js')),
);

await $$({
  env: {...process.env, NODE_ENV: 'test', KOSMIC_ENV: 'test'},
})`node --test --watch ${path.join('dist', 'test', 'server.test.js')}`;

tscWatch.kill();
