#!/usr/bin/env node
// @ts-check

import process from 'node:process';
import {execaNode, $} from 'execa';
import pWaitFor from 'p-wait-for';
import {pathExists} from 'path-exists';
import {tsWatch} from './ts-watch.js';

const program = tsWatch();

await pWaitFor(() => pathExists('dist/src/index.js'));

await Promise.all([
  execaNode({
    stdio: 'inherit',
    cwd: process.cwd(),
    nodeOptions: ['--watch'],
  })`dist/src/index.js`,
  $({stdio: 'inherit', cwd: process.cwd()})`vite`,
]);

program.close();
