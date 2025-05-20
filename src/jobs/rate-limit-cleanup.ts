#!/usr/bin/env node
import process from 'node:process';
import {KyselyRateLimitStore} from '#utils/kysely-rate-limit-store.js';
import {jobsLogger as logger} from '#utils/logger.js';

const rateLimitStore = new KyselyRateLimitStore();

logger.info('Cleaning up rate limit store...');
await rateLimitStore.cleanup();
logger.info('Rate limit store cleanup complete.');

process.exit(0);
