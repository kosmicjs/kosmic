import {
  KosmicAuth,
  PostgresSessionStore,
  PostgresStorageAdapter,
} from '@kosmic/auth';
import {dialect} from '#db/index.js';
import {kosmicServer} from '#server';

export const auth = new KosmicAuth(
  kosmicServer,
  new PostgresStorageAdapter(dialect),
  new PostgresSessionStore(dialect),
);
