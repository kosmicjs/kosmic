import type {Middleware} from 'koa';
import type {Logger} from '@kosmic/logger';
import type {SessionStore} from '@kosmic/server';
import {
  createAuthMiddleware,
  createPassport,
  type AuthPassport,
  type CreateAuthMiddlewareResult,
  type CreatePassportOptions,
} from './passport.ts';
import {
  KyselySessionStore,
  type KyselySessionStoreDb,
} from './session-store.ts';

export type {SelectableUser} from './models/users.ts';
export type {SessionRow} from './models/sessions.ts';
export type {AuthDatabase} from './models/index.ts';
export {
  extractKeyPrefix,
  generateApiKey,
  apiKeySchema,
  apiKeyInsertSchema,
} from './models/api-keys.ts';
export {
  createPassport,
  createAuthMiddleware,
  type AuthPassport,
  type CreatePassportOptions,
  type CreateAuthMiddlewareResult,
} from './passport.ts';
export {
  KyselySessionStore,
  type KyselySessionStoreDb,
} from './session-store.ts';
export type * from './types.ts';

export type CreateKosmicAuthOptions = {
  db: KyselySessionStoreDb;
  logger: Logger;
  passport: Omit<CreatePassportOptions, 'db' | 'logger'>;
};

export type KosmicAuth = {
  passport: AuthPassport;
  sessionStore: SessionStore;
} & CreateAuthMiddlewareResult;

/**
 * Creates a configured authentication bundle for Kosmic apps.
 */
export function createKosmicAuth(options: CreateKosmicAuthOptions): KosmicAuth {
  const passport = createPassport({
    db: options.db,
    logger: options.logger,
    ...options.passport,
  });

  return {
    passport,
    sessionStore: new KyselySessionStore(options.db, options.logger),
    ...createAuthMiddleware(passport),
  };
}

/**
 * Creates a route middleware that enforces session authentication.
 */
export function createRequireSessionAuthMiddleware(
  redirectTo = '/login',
): Middleware {
  return async (ctx, next) => {
    if (!ctx.isAuthenticated()) {
      ctx.redirect(`${redirectTo}?redirect=${ctx.request.url}`);
      return;
    }

    await next();
  };
}
