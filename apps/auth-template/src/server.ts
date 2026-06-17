import path from 'node:path';
import {KosmicServer} from '@kosmic/server';
import {
  KosmicAuth,
  PostgresSessionStore,
  PostgresStorageAdapter,
} from '@kosmic/auth';
import {dialect} from '#db/index.js';

export const auth = new KosmicAuth(
  new PostgresStorageAdapter(dialect),
  new PostgresSessionStore(dialect),
);

const routesDir = path.join(import.meta.dirname, 'routes');

export const kosmicServer = new KosmicServer({
  routesDir,
  preRegisterRoutes: auth.initialize,
});
