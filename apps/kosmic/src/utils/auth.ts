import {
  createPassport,
  KyselySessionStore,
  type KyselySessionStoreDb,
  type Passport,
} from '@kosmic/auth';
import type {Context} from '@kosmic/server';
import {db} from '#db/index.js';
import logger from '#utils/logger.js';

type PassportDb = Parameters<typeof createPassport>[0]['db'];

// Kysely is invariant on its schema generic, so we bridge the app schema to auth's subset at the boundary.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const passportDb = db as unknown as PassportDb;
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const sessionStoreDb = db as unknown as KyselySessionStoreDb;

export const passport: Passport = createPassport({
  db: passportDb,
  logger,
});

export const sessionStore = new KyselySessionStore(sessionStoreDb, logger);

/**
 * Ensures the current request has an authenticated user id.
 */
export function requireUserId(ctx: Context): number {
  const userId = ctx.state.user?.id;

  if (typeof userId !== 'number') {
    throw new TypeError('Unauthorized');
  }

  return userId;
}

/**
 * Session-based local authentication middleware.
 */
export const authenticateLocal = passport.authenticate('local');

/**
 * Bearer token authentication middleware for API routes.
 */
export const authenticateBearer = passport.authenticate('bearer', {
  session: false,
});
