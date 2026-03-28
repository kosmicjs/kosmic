#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {parseArgs} from 'node:util';

const HELP_TEXT = `
Remove build output for a kosmic application.

Usage
  $ kosmic clean [options]

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

await fs.rm(path.resolve(cwd, 'dist'), {recursive: true, force: true});
