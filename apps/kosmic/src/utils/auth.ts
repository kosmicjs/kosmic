import {getPassport, type Context} from '@kosmic/server';

export const passport = getPassport();

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
