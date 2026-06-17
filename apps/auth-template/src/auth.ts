import {
  KosmicAuth,
  PostgresSessionStore,
  PostgresStorageAdapter,
} from '@kosmic/auth';
import {kosmicDb} from '#db/index.js';

export const auth = new KosmicAuth(
  new PostgresStorageAdapter(kosmicDb.dialect),
  new PostgresSessionStore(kosmicDb.dialect),
);
