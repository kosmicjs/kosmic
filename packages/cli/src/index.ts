#!/usr/bin/env node
import process from 'node:process';
import {parseArgs} from 'node:util';

const COMMANDS = {
  build: 'build',
  buildVitePlugin: 'build:vite-plugin',
  check: 'check',
  clean: 'clean',
  compile: 'compile',
  compileCp: 'compile:cp',
  compileTsc: 'compile:tsc',
  compileVite: 'compile:vite',
  create: 'create',
  dev: 'dev',
  lint: 'lint',
  migrate: 'migrate',
  prepublishOnly: 'prepublishOnly',
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
  build
  build:vite-plugin
  check
  clean
  compile
  compile:cp
  compile:tsc
  compile:vite
  create
  dev
  lint
  migrate
  prepublishOnly
  start
  test
  test:watch

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

  case COMMANDS.buildVitePlugin: {
    await import('./build-vite-plugin/cli.ts');

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

  case COMMANDS.compile: {
    await import('./compile/cli.ts');

    break;
  }

  case COMMANDS.compileCp: {
    await import('./compile-cp/cli.ts');

    break;
  }

  case COMMANDS.compileTsc: {
    await import('./compile-tsc/cli.ts');

    break;
  }

  case COMMANDS.compileVite: {
    await import('./compile-vite/cli.ts');

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

  default: {
    console.error(`Unknown command: ${command}`);
    console.log(helpText);
    process.exit(1);
  }
}
