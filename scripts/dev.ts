#!/usr/bin/env node

import process from 'node:process';
import fs from 'node:fs/promises';
import path from 'node:path';
import {$} from 'execa';
import pWaitFor from 'p-wait-for';
import {pathExists} from 'path-exists';
import {tsWatch} from './ts-watch.ts';

const cwd = process.cwd();

await fs.rm('dist', {recursive: true, force: true});

const program = tsWatch();

const $$ = $({stdio: 'inherit', cwd});

await pWaitFor(async () => pathExists('dist/src/index.js'));

await Promise.all([
  $$({
    node: true,
    nodeOptions: ['--watch', '--watch-preserve-output'],
  })`${path.join(cwd, 'dist', 'src', 'index.js')}`,
  $$`vite`,
]);

program.close();
