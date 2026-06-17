import {
  KosmicAuth,
  PostgresSessionStore,
  PostgresStorageAdapter,
} from '@kosmic/auth2';
import {dialect} from '#db/index.js';
import {kosmicServer} from '#server';

export const auth = new KosmicAuth(
  kosmicServer.app,
  new PostgresStorageAdapter(dialect),
  new PostgresSessionStore(dialect),
);
