#!/usr/bin/env node

import process from 'node:process';
import fs from 'node:fs/promises';
import path from 'node:path';
import {execa} from 'execa';
import pWaitFor from 'p-wait-for';
import {pathExists} from 'path-exists';
import {createServer} from 'vite';

/**
 * This script is used to start the development server for the application.
 * It compiles the TypeScript files in watch mode, and waits for the output.
 * Then it starts the kosmic server and the vite server simultaneously.
 * We monitor the ipc channel for a ready message from the kosmic server that occurs after an automatic restart.
 * When we recieve the ready messaage we send a web-socket message through vite server to reload the page.
 */

const cwd = process.cwd();
const distFolder = path.resolve(cwd, 'dist');
const publicFolder = path.resolve(distFolder, 'src', 'public');

// initialize execa
const $$ = execa({cwd, stdio: 'inherit', ipc: true});

// clean the dist folder
await fs.rm('dist', {recursive: true, force: true});

// start ts
const program = $$`tsc --watch --preserveWatchOutput`;

// wait for the ts output
await pWaitFor(async () => pathExists('dist/src/index.js'));

// copy the public folder to the dist folder
await fs.cp(path.resolve(cwd, 'src', 'public'), publicFolder, {
  recursive: true,
});

const server = await createServer();

async function runKosmicDevServer() {
  const cp = $$`node --watch --watch-preserve-output --enable-source-maps ${path.join('dist', 'src', 'index.js')}`;

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
}

await Promise.all([
  // start the kosmic server
  runKosmicDevServer(),
  // start the jobs server from the dist folder in watch mode and enable source maps
  $$`node --watch --watch-preserve-output --enable-source-maps ${path.join('dist', 'src', 'jobs.js')}`,
  // start the vite server running and wait for it to end
  server.listen(),
  // await the end of the ts --watch program
  program,
]);
