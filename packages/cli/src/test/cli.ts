#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {execa} from 'execa';

const cwd = process.cwd();
const $$ = execa({cwd, stdio: 'inherit'});

await fs.rm(path.resolve(cwd, 'dist'), {recursive: true, force: true});
await $$`tsc -p tsconfig.json`;
await $$({
  env: {...process.env, NODE_ENV: 'test', KOSMIC_ENV: 'test'},
})`node --test ${path.join('dist', 'test', 'server.test.js')}`;
