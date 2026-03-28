import path from 'node:path';
import {KosmicServer} from '@kosmic/server';
import {config} from '@kosmic/config';
import logger from '#utils/logger.js';
import {passport, sessionStore} from '#middleware/auth.js';

export const getServer = () =>
  new KosmicServer({
    logger,
    nodeEnv: config.nodeEnv,
    kosmicEnv: config.kosmicEnv,
    sessionKeys: config.sessionKeys,
    publicDir: path.join(import.meta.dirname, 'public'),
    routesDir: path.join(import.meta.dirname, 'routes'),
    sessionStore,
    passport,
  });
