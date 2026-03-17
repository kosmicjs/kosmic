#!/usr/bin/env node --experimental-strip-types
/**
 * Package generator CLI for the Kosmic monorepo.
 * Scaffolds a new package in packages/ using the package-template.
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';
import {parseArgs} from 'node:util';
import {spawnSync} from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const {values} = parseArgs({
  options: {
    help: {
      type: 'boolean',
      short: 'h',
      default: false,
    },
    name: {
      type: 'string',
      short: 'n',
    },
  },
  strict: true,
});

/**
 * Recursively copies template files into the target directory,
 * replacing all occurrences of "{{name}}" with the actual package name.
 */
function copyTemplate(
  sourceDir: string,
  destinationDir: string,
  packageName: string,
): void {
  fs.mkdirSync(destinationDir, {recursive: true});

  for (const entry of fs.readdirSync(sourceDir, {withFileTypes: true})) {
    const sourcePath = path.join(sourceDir, entry.name);
    const destinationPath = path.join(
      destinationDir,
      entry.name.replace('.template', ''),
    );

    if (entry.isDirectory()) {
      copyTemplate(sourcePath, destinationPath, packageName);
    } else {
      const content = fs.readFileSync(sourcePath, 'utf8');
      fs.writeFileSync(
        destinationPath,
        content.replaceAll('{{name}}', packageName),
        'utf8',
      );
    }
  }
}

/**
 * Main generator function. Throws on invalid input or if the package already exists.
 */
function generate(): void {
  if (values.help) {
    console.log(
      [
        'Usage: generate --name <package-name>',
        '',
        'Options:',
        '  --name, -n   Name of the new package folder in packages/ (required).',
        '               The package will be published as @kosmic/<name>.',
        '  --help, -h   Show this help message.',
      ].join('\n'),
    );
    return;
  }

  const {name} = values;

  if (!name) {
    throw new Error('--name is required. Run with --help for usage.');
  }

  // eslint-disable-next-line require-unicode-regexp
  if (!/^[a-z\d][a-z\d-]*$/.test(name)) {
    throw new Error(
      '--name must be a valid package name (lowercase letters, numbers, and hyphens only).',
    );
  }

  const rootDir = path.resolve(__dirname, '../..');
  const targetDir = path.join(rootDir, 'packages', name);
  const templateDir = path.join(__dirname, 'package-template');

  if (fs.existsSync(targetDir)) {
    throw new Error(`Package "${name}" already exists at ${targetDir}.`);
  }

  console.log(`Scaffolding @kosmic/${name} in packages/${name}...`);
  copyTemplate(templateDir, targetDir, name);

  console.log('Running xo --fix on the new package...');
  const result = spawnSync('npx', ['xo', '--fix', `packages/${name}`], {
    cwd: rootDir,
    stdio: 'inherit',
  });

  if ((result.status ?? 1) !== 0) {
    throw new Error(
      'xo --fix reported errors. Review the generated files and fix manually.',
    );
  }

  console.log(
    `\n✔ Package @kosmic/${name} created successfully at packages/${name}`,
  );
}

try {
  generate();
} catch (error: unknown) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
