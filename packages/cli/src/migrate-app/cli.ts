#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {execa} from 'execa';

const cwd = process.cwd();
const $$ = execa({cwd, stdio: 'inherit'});

await fs.rm(path.resolve(cwd, 'dist'), {recursive: true, force: true});
await $$`tsc --build tsconfig.json`;
await $$({
  env: {...process.env, KOSMIC_ENV: 'migration'},
})`migrate -d ./src/db/index.ts --migrations ./src/db/migrations.ts`;
