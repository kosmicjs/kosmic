#!/usr/bin/env node
import process from 'node:process';
import {parseArgs} from 'node:util';

const COMMANDS = {
  dev: 'dev',
  migrate: 'migrate',
  build: 'build',
  start: 'start',
} as const;

const helpText = `
kos

Cli for kosmic server framework.

Usage
  $ kos <command> [options]

Commands
  dev
  migrate
  build
  start

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

const [command] = cli.positionals;

if (!command) {
  if (cli.values.help) {
    console.log(helpText);
    process.exit(0);
  }

  console.error('No command provided.');
  console.log(helpText);
  process.exit(1);
}

switch (command) {
  case COMMANDS.dev: {
    await import('./dev/cli.ts');

    break;
  }

  case COMMANDS.migrate: {
    await import('./migrate/cli.ts');

    break;
  }

  // case COMMANDS.build: {
  //   await import('./build/cli.ts');

  //   break;
  // }

  // case COMMANDS.start: {
  //   await import('./start/cli.ts');

  //   break;
  // }

  default: {
    console.error(`Unknown command: ${command}`);
    console.log(helpText);
    process.exit(1);
  }
}
