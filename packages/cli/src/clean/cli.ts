#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const cwd = process.cwd();

await fs.rm(path.resolve(cwd, 'dist'), {recursive: true, force: true});
