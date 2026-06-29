#!/usr/bin/env node
import process from 'node:process';
import {parseArgs} from 'node:util';

const COMMANDS = {
  build: 'build',
  check: 'check',
  clean: 'clean',
  create: 'create',
  generate: 'generate',
  dev: 'dev',
  lint: 'lint',
  migrate: 'migrate',
  start: 'start',
  test: 'test',
  testWatch: 'test:watch',
} as const;

const helpText = `
kos

Cli for kosmic server framework.

Usage
  $ kos <command> [options]

Commands
  ${Object.values(COMMANDS).join('\n  ')}

Options
  --help, -h          Show this help message
`.trim();

const cli = parseArgs({
  allowPositionals: true,
  strict: false,
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
  case COMMANDS.build: {
    await import('./build/cli.ts');

    break;
  }

  case COMMANDS.check: {
    await import('./check/cli.ts');

    break;
  }

  case COMMANDS.clean: {
    await import('./clean/cli.ts');

    break;
  }

  case COMMANDS.create: {
    await import('./create/cli.ts');

    break;
  }

  case COMMANDS.dev: {
    await import('./dev/cli.ts');

    break;
  }

  case COMMANDS.lint: {
    await import('./lint/cli.ts');

    break;
  }

  case COMMANDS.migrate: {
    await import('./migrate/cli.ts');

    break;
  }

  case COMMANDS.start: {
    await import('./start/cli.ts');

    break;
  }

  case COMMANDS.test: {
    await import('./test_/cli.ts');

    break;
  }

  case COMMANDS.testWatch: {
    await import('./test-watch/cli.ts');

    break;
  }

  case COMMANDS.generate: {
    await import('./generate/cli.ts');

    break;
  }

  default: {
    console.error(`Unknown command: ${command}`);
    console.log(helpText);
    process.exit(1);
  }
}
