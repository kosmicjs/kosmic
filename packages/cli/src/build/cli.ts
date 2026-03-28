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
  --help, -h          Show this help message
`.trim();

const cli = parseArgs({
  allowPositionals: true,
  options: {
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

const cwd = process.cwd();
const $$ = execa({cwd, stdio: 'inherit'});

// clean
await fs.rm(path.resolve(cwd, 'dist'), {recursive: true, force: true});

// compile:tsc
await $$`tsc --build tsconfig.json`;

// compile:vite
await $$`vite build`;

// compile:cp
await fs.cp(
  path.resolve(cwd, 'src', 'public'),
  path.resolve(cwd, 'dist', 'src', 'public'),
  {recursive: true},
);
