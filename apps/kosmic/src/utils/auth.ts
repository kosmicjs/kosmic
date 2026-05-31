import {createPassport, KyselySessionStore, type Passport} from '@kosmic/auth';
import type {Context} from '@kosmic/server';
import {db} from '#db/index.js';

export const passport: Passport = createPassport({
  db,
});

export const sessionStore = new KyselySessionStore(db);

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
