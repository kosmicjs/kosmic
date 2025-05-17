#!/usr/bin/env node
import {KyselyRateLimitStore} from '#utils/kysely-rate-limit-store.js';

const rateLimitStore = new KyselyRateLimitStore();

await rateLimitStore.cleanup();
