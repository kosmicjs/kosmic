#!/usr/bin/env node

import process from 'node:process';
import {execa} from 'execa';

const cwd = process.cwd();
const $$ = execa({cwd, stdio: 'inherit'});

await $$`xo`;
