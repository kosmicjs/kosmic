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
