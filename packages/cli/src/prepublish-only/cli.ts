#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {parseArgs} from 'node:util';
import {execa} from 'execa';

const HELP_TEXT = `
Run prepublish build steps for a kosmic application.

Usage
  $ kosmic prepublish-only [options]

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
await $$`tsc --build tsconfig.json`;
await $$`vite build`;
await fs.cp(
  path.resolve(cwd, 'src', 'public'),
  path.resolve(cwd, 'dist', 'src', 'public'),
  {recursive: true},
);
