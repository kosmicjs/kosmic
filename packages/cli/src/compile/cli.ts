#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {execa} from 'execa';

const cwd = process.cwd();
const $$ = execa({cwd, stdio: 'inherit'});

await $$`tsc --build tsconfig.json`;
await $$`vite build`;
await fs.cp(
  path.resolve(cwd, 'src', 'public'),
  path.resolve(cwd, 'dist', 'src', 'public'),
  {recursive: true},
);
