import type {Middleware} from 'koa';
import {config} from '@kosmic/config';
import type {Kysely} from '@kosmic/db';
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
import {userInsertSchema} from './models/users.ts';

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
 * Creates a fully configured auth bundle using shared app config defaults.
 */
export function createKosmicAuthFromConfig<TDatabase>(options: {
  db: Kysely<TDatabase>;
  logger: Logger;
}): KosmicAuth {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  const authDb = options.db as unknown as KyselySessionStoreDb;

  const passportOptions: CreateKosmicAuthOptions['passport'] = {
    async createGithubUser(input) {
      const user = await authDb
        .insertInto('users')
        .values(
          await userInsertSchema.parseAsync({
            first_name: input.firstName,
            role: 'user',
            last_name: input.lastName,
            email: input.email,
            github_access_token: input.accessToken,
            github_refresh_token: input.refreshToken,
          }),
        )
        .returning(['id', 'email', 'first_name', 'last_name', 'role'])
        .executeTakeFirstOrThrow();

      return {
        id: user.id,
        email: user.email,
        first_name: user.first_name ?? undefined,
        last_name: user.last_name ?? undefined,
        role: user.role,
      };
    },
  };

  if (
    config.github?.clientID &&
    config.github.clientSecret &&
    config.github.callbackURL
  ) {
    passportOptions.github = {
      clientID: config.github.clientID,
      clientSecret: config.github.clientSecret,
      callbackURL: config.github.callbackURL,
    };
  }

  return createKosmicAuth({
    db: authDb,
    logger: options.logger,
    passport: passportOptions,
  });
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
