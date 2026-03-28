#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {execa} from 'execa';
import pWaitFor from 'p-wait-for';
import {pathExists} from 'path-exists';

const cwd = process.cwd();
const $$ = execa({cwd, stdio: 'inherit'});

await fs.rm(path.resolve(cwd, 'dist'), {recursive: true, force: true});

const tscWatch = $$`tsc -p tsconfig.json --watch`;

await pWaitFor(async () =>
  pathExists(path.join('dist', 'test', 'server.test.js')),
);

await $$({
  env: {...process.env, NODE_ENV: 'test', KOSMIC_ENV: 'test'},
})`node --test --watch ${path.join('dist', 'test', 'server.test.js')}`;

tscWatch.kill();
