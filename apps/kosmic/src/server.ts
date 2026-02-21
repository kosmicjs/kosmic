import path from 'node:path';
import {
  Koa,
  createServer as createSharedServer,
  getCtx as getSharedCtx,
  type Context,
} from '@kosmic/server';
import {KyselySessionStore} from '#utils/kysely-session-store.js';
import logger from '#utils/logger.js';
import {config} from '#config/index.js';
import {passport} from '#middleware/passport.js';

export const app = new Koa({asyncLocalStorage: true});

export async function createServer() {
  return createSharedServer({
    app,
    logger,
    env: {
      nodeEnv: config.nodeEnv,
      kosmicEnv: config.kosmicEnv,
      sessionKeys: config.sessionKeys,
    },
    publicDir: path.join(import.meta.dirname, 'public'),
    routesDir: path.join(import.meta.dirname, 'routes'),
    sessionStore: new KyselySessionStore(),
    passport,
  });
}

export const getCtx = (): Context => getSharedCtx(app);
