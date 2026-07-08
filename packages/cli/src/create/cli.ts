#!/usr/bin/env node

import path from 'node:path';
import process from 'node:process';
import type readline from 'node:readline/promises';
import {parseArgs} from 'node:util';
import {execa} from 'execa';

const HELP_TEXT = `
Bootstrap a new Kosmic app template.

Usage
  $ kosmic create [project-name] [options]

Options
  --auth              Include login/account routes and auth scaffolding
  --no-auth           Skip auth scaffolding
  --force             Overwrite existing target directory
  --yes, -y           Use defaults and skip prompts
  --install           Run npm install after scaffolding
  --no-install        Skip npm install after scaffolding
  --cwd               Working directory (default: process.cwd())
  --help, -h          Show this help message
`.trim();

type PromptOptions = {
  readonly defaultText?: string;
};

/**
 * Prompt for a single text value and fall back to a default when empty.
 */
async function promptText(
  rl: readline.Interface,
  message: string,
  options: PromptOptions = {},
): Promise<string> {
  const suffix = options.defaultText ? ` (${options.defaultText})` : '';
  const promptResult = await rl.question(`${message}${suffix}: `);
  const value = promptResult.trim();

  if (value.length === 0 && options.defaultText) {
    return options.defaultText;
  }

  return value;
}

/**
 * Prompt for a yes/no answer with a default value.
 */
async function promptYesNo(
  rl: readline.Interface,
  message: string,
  shouldDefaultYes: boolean,
): Promise<boolean> {
  const label = shouldDefaultYes ? 'Y/n' : 'y/N';
  const promptResult = await rl.question(`${message} (${label}): `);
  const rawValue = promptResult.trim().toLowerCase();

  if (rawValue.length === 0) {
    return shouldDefaultYes;
  }

  return rawValue === 'y' || rawValue === 'yes';
}

/**
 * Convert a package name candidate into an npm-compatible name.
 */
function normalizeProjectName(value: string): string {
  const trimmedValue = value.trim().toLowerCase();
  const normalized = trimmedValue.replaceAll(/[^\-0-9_a-z]+/gv, '-');

  let start = 0;
  let end = normalized.length;

  while (start < end && normalized[start] === '-') {
    start += 1;
  }

  while (end > start && normalized[end - 1] === '-') {
    end -= 1;
  }

  return normalized.slice(start, end) || 'kosmic-app';
}

const cli = parseArgs({
  allowPositionals: true,
  options: {
    auth: {
      type: 'boolean',
    },
    'no-auth': {
      type: 'boolean',
    },
    force: {
      type: 'boolean',
    },
    yes: {
      type: 'boolean',
      short: 'y',
    },
    install: {
      type: 'boolean',
    },
    'no-install': {
      type: 'boolean',
    },
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

if (cli.values.auth && cli.values['no-auth']) {
  console.error('Choose either --auth or --no-auth, not both.');
  process.exit(1);
}

if (cli.values.install && cli.values['no-install']) {
  console.error('Choose either --install or --no-install, not both.');
  process.exit(1);
}
