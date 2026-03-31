#!/usr/bin/env node

import path from 'node:path';
import process from 'node:process';
import readline from 'node:readline/promises';
import {parseArgs} from 'node:util';
import {execa} from 'execa';
import {directoryHasFiles, scaffoldKosmicProject} from './scaffold.ts';

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
  readonly defaultValue?: string;
};

/**
 * Prompt for a single text value and fall back to a default when empty.
 */
async function promptText(
  rl: readline.Interface,
  message: string,
  options: PromptOptions = {},
): Promise<string> {
  const suffix = options.defaultValue ? ` (${options.defaultValue})` : '';
  const promptResult = await rl.question(`${message}${suffix}: `);
  const value = promptResult.trim();

  if (value.length === 0 && options.defaultValue) {
    return options.defaultValue;
  }

  return value;
}

/**
 * Prompt for a yes/no answer with a default value.
 */
async function promptYesNo(
  rl: readline.Interface,
  message: string,
  defaultValue: boolean,
): Promise<boolean> {
  const label = defaultValue ? 'Y/n' : 'y/N';
  const promptResult = await rl.question(`${message} (${label}): `);
  const rawValue = promptResult.trim().toLowerCase();

  if (rawValue.length === 0) {
    return defaultValue;
  }

  return rawValue === 'y' || rawValue === 'yes';
}

/**
 * Convert a package name candidate into an npm-compatible name.
 */
function normalizeProjectName(value: string): string {
  return (
    value
      .trim()
      .toLowerCase()
      .replaceAll(/[^a-z0-9_\-]+/gv, '-')
      .replaceAll(/^-+/gv, '')
      .replaceAll(/-+$/gv, '') || 'kosmic-app'
  );
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

const providedName = cli.positionals.slice(1)[0];
const cwd = cli.values.cwd ?? process.cwd();
const useDefaults = cli.values.yes === true;

let projectName = normalizeProjectName(providedName ?? '');
let withAuth = cli.values.auth === true;
let installDependencies = cli.values.install === true;

const authWasExplicit =
  cli.values.auth === true || cli.values['no-auth'] === true;
const installWasExplicit =
  cli.values.install === true || cli.values['no-install'] === true;

if (cli.values['no-auth']) {
  withAuth = false;
}

if (cli.values['no-install']) {
  installDependencies = false;
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

try {
  if (!providedName && !useDefaults) {
    projectName = normalizeProjectName(
      await promptText(rl, 'Project name', {defaultValue: 'kosmic-app'}),
    );
  }

  if (!authWasExplicit && !useDefaults) {
    withAuth = await promptYesNo(
      rl,
      'Include auth routes (login/account)?',
      false,
    );
  }

  if (!installWasExplicit && !useDefaults) {
    installDependencies = await promptYesNo(rl, 'Install dependencies?', true);
  } else if (!installWasExplicit && useDefaults) {
    installDependencies = true;
  }

  const targetDirectory = path.resolve(cwd, projectName);
  let forceWrite = cli.values.force === true;

  if (!forceWrite && (await directoryHasFiles(targetDirectory))) {
    if (useDefaults) {
      console.error(`Target directory is not empty: ${targetDirectory}`);
      process.exit(1);
    }

    forceWrite = await promptYesNo(
      rl,
      `Directory ${projectName} is not empty. Overwrite it?`,
      false,
    );

    if (!forceWrite) {
      console.error('Aborted.');
      process.exit(1);
    }
  }

  await scaffoldKosmicProject({
    projectName,
    targetDirectory,
    withAuth,
    force: forceWrite,
  });

  if (installDependencies) {
    const $$ = execa({cwd: targetDirectory, stdio: 'inherit'});
    await $$`npm install`;
  }

  console.log(`\nCreated ${projectName} at ${targetDirectory}`);
  console.log('\nNext steps:');
  console.log(`  cd ${projectName}`);
  if (!installDependencies) {
    console.log('  npm install');
  }

  console.log('  npm run dev');
} finally {
  rl.close();
}
