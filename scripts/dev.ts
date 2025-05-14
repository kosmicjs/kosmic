#!/usr/bin/env node

import process from 'node:process';
import fs from 'node:fs/promises';
import path from 'node:path';
import {execa} from 'execa';
import pWaitFor from 'p-wait-for';
import {pathExists} from 'path-exists';
import {createServer} from 'vite';

const cwd = process.cwd();
const distFolder = path.resolve(cwd, 'dist');
const publicFolder = path.resolve(distFolder, 'src', 'public');
await fs.rm('dist', {recursive: true, force: true});

const $$ = execa({cwd, stdio: 'inherit'});

const program = $$`tsc --watch --preserveWatchOutput`;

await pWaitFor(async () => pathExists('dist/src/index.js'));

await fs.cp(path.resolve(cwd, 'src', 'public'), publicFolder, {
  recursive: true,
});

const server = await createServer();

await Promise.all([
  (async () => {
    const cp = $$({
      ipc: true,
    })`node --watch --watch-preserve-output --enable-source-maps ${path.join('dist', 'src', 'index.js')}`;

    cp.on('message', (msg: unknown) => {
      if (
        typeof msg === 'object' &&
        msg !== null &&
        'status' in msg &&
        msg.status === 'ready'
      ) {
        server.ws.send({
          type: 'full-reload',
        });
      }
    });
  })(),
  $$`node --watch --watch-preserve-output --enable-source-maps ${path.join('dist', 'src', 'jobs.js')}`,
  server.listen(),
  program,
]);
