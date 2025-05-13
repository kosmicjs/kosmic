#!/usr/bin/env node

import process from 'node:process';
import fs from 'node:fs/promises';
import path from 'node:path';
import {execa} from 'execa';
import pWaitFor from 'p-wait-for';
import {pathExists} from 'path-exists';
import {createServer} from 'vite';
import colors from 'picocolors';
import {tsWatch} from './ts-watch.ts';

const cwd = process.cwd();
const distFolder = path.resolve(cwd, 'dist');
const publicFolder = path.resolve(distFolder, 'src', 'public');
await fs.rm('dist', {recursive: true, force: true});

const program = tsWatch();

const $$ = execa({cwd, stdio: 'inherit'});

await pWaitFor(async () => pathExists('dist/src/index.js'));

await fs.cp(path.resolve(cwd, 'src', 'public'), publicFolder, {
  recursive: true,
});

const server = await createServer();

await Promise.all([
  (async () => {
    const cp = $$({
      stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
      verbose: 'full',
    })`node --watch --watch-preserve-output ${path.join('dist', 'src', 'index.js')}`;

    cp.on('message', (msg) => {
      if (typeof msg === 'string' && msg.startsWith('ready')) {
        server.config.logger.info(`${colors.green('Refresh Browser')}`);
        server.ws.send({
          type: 'full-reload',
        });
      }
    });
  })(),
  $$`node dist/src/jobs.js`,
  server.listen(),
]);

program.close();
