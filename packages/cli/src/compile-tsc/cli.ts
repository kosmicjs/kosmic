#!/usr/bin/env node

import process from 'node:process';
import {parseArgs} from 'node:util';
import {execa} from 'execa';

const HELP_TEXT = `
Compile TypeScript for a kosmic application.

Usage
  $ kosmic compile-tsc [options]

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

await $$`tsc --build tsconfig.json`;
