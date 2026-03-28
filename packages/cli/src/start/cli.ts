#!/usr/bin/env node

import path from 'node:path';
import process from 'node:process';
import {execa} from 'execa';

const cwd = process.cwd();
const $$ = execa({cwd, stdio: 'inherit'});

await $$({
  env: {...process.env, NODE_ENV: 'production', KOSMIC_ENV: 'production'},
})`node ${path.join('dist', 'src', 'index.js')}`;
