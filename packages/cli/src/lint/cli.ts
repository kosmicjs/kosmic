#!/usr/bin/env node

import process from 'node:process';
import {parseArgs} from 'node:util';
import {execa} from 'execa';

const HELP_TEXT = `
Run lint checks for a kosmic application.

Usage
  $ kosmic lint [options]

Options
  --cwd               Working directory (default: process.cwd())
  --help, -h          Show this help message
`.trim();

const cli = parseArgs({
  args: process.argv.slice(2),
  allowPositionals: true,
  strict: false,
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

const cwd = typeof cli.values.cwd === 'string' ? cli.values.cwd : process.cwd();

try {
  await execa('xo', cli.positionals, {
    cwd,
    stdio: 'inherit',
  });
} catch {
  process.exit(1);
}
