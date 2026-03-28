#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const cwd = process.cwd();

await fs.cp(
  path.resolve(cwd, 'src', 'public'),
  path.resolve(cwd, 'dist', 'src', 'public'),
  {recursive: true},
);
