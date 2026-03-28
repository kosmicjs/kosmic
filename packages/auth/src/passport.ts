/* eslint-disable @typescript-eslint/no-unsafe-type-assertion */
import passport from 'koa-passport';
import argon2 from 'argon2';
import {Strategy as LocalStrategy} from 'passport-local';
import {Strategy as BearerStrategy} from 'passport-http-bearer';
import {Strategy as GithubStrategy} from 'passport-github2';
import type {Middleware} from 'koa';
import type {Kysely} from '@kosmic/db';
import type {Logger} from '@kosmic/logger';
import type {PassportLike} from '@kosmic/server';
import {extractKeyPrefix} from './models/api-keys.ts';
import type {AuthDatabase} from './models/index.ts';

type StrategyUser = {
  id: number;
  email: string;
  first_name: string | undefined;
  last_name: string | undefined;
  role: 'admin' | 'user';
};

type GithubConfig = {
  clientID?: string;
  clientSecret?: string;
  callbackURL?: string;
};

type GithubProfile = {
  emails?: Array<{value: string}>;
  displayName?: string;
};

export type AuthPassport = PassportLike & {
  authenticate: (
    strategy: string,
    options?: Record<string, unknown>,
  ) => Middleware;
  use: (...arguments_: unknown[]) => void;
  serializeUser: (...arguments_: unknown[]) => void;
  deserializeUser: (...arguments_: unknown[]) => void;
};

export type CreatePassportOptions = {
  db: Kysely<AuthDatabase>;
  logger: Logger;
  github?: GithubConfig;
  /** Creates a user when a github account does not already exist. */
  createGithubUser?: (input: {
    email: string;
    firstName: string;
    lastName: string;
    accessToken: string;
    refreshToken: string;
  }) => Promise<StrategyUser>;
};

export type CreateAuthMiddlewareResult = {
  authenticateLocal: Middleware;
  authenticateBearer: Middleware;
};

/**
 * Converts unknown thrown values into Error instances.
 */
function toError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }

  return new Error('Unknown auth error');
}

/**
 * Creates and configures a passport instance with local, bearer, and optional github strategies.
 */
export function createPassport(options: CreatePassportOptions): AuthPassport {
  const {db, logger} = options;

  // @ts-expect-error third-party type is too loose
  passport.serializeUser((user: StrategyUser, done) => {
    logger.debug({user}, 'serializing user');
    done(null, user.id);
  });

  passport.deserializeUser((id: number, done) => {
    void (async () => {
      try {
        const user = await db
          .selectFrom('users')
          .select(['id', 'email', 'first_name', 'last_name', 'role'])
          .where('id', '=', id)
          .where('is_active', '=', true)
          .executeTakeFirst();

        logger.trace({user}, 'deserialized user');

        if (user) {
          done(null, user);
          return;
        }

        done(null, false);
      } catch (error: unknown) {
        logger.error(error);
        done(toError(error), {message: 'User not found'});
      }
    })();
  });

  passport.use(
    'local',
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
      },
      (email, password, done) => {
        void (async () => {
          try {
            if (!email) {
              throw new Error('Username is required');
            }

            if (!password) {
              throw new Error('Password is required');
            }

            const user = await db
              .selectFrom('users')
              .select([
                'id',
                'email',
                'first_name',
                'last_name',
                'role',
                'hash',
              ])
              .where('email', '=', email)
              .where('is_active', '=', true)
              .executeTakeFirst();

            if (!user?.hash || !(await argon2.verify(user.hash, password))) {
              done(null, false);
              return;
            }

            done(null, {
              id: user.id,
              email: user.email,
              first_name: user.first_name ?? undefined,
              last_name: user.last_name ?? undefined,
              role: user.role,
            });
          } catch (error: unknown) {
            logger.error(error);
            done(null, false);
          }
        })();
      },
    ),
  );

  passport.use(
    'bearer',
    new BearerStrategy((token, done) => {
      void (async () => {
        try {
          logger.debug({token}, 'bearer token received');
          const keyPrefix = extractKeyPrefix(token);

          if (!keyPrefix) {
            logger.warn('Invalid API key format');
            done(null, false);
            return;
          }

          const apiKeys = await db
            .selectFrom('api_keys')
            .select(['user_id', 'is_active', 'expires_at', 'id', 'key_hash'])
            .where('key_prefix', '=', keyPrefix)
            .where('is_active', '=', true)
            .execute();

          let validApiKey: (typeof apiKeys)[number] | undefined;

          for (const apiKey of apiKeys) {
            // eslint-disable-next-line no-await-in-loop
            if (await argon2.verify(apiKey.key_hash, token)) {
              validApiKey = apiKey;
              break;
            }
          }

          if (!validApiKey) {
            logger.warn('No valid API key found for token');
            done(null, false);
            return;
          }

          if (
            validApiKey.expires_at &&
            new Date(validApiKey.expires_at) < new Date()
          ) {
            logger.warn('API key has expired');
            done(null, false);
            return;
          }

          await db
            .updateTable('api_keys')
            .set({last_used_at: new Date()})
            .where('id', '=', validApiKey.id)
            .execute();

          const user = await db
            .selectFrom('users')
            .select(['id', 'email', 'first_name', 'last_name', 'role'])
            .where('id', '=', validApiKey.user_id)
            .where('is_active', '=', true)
            .executeTakeFirst();

          if (!user) {
            logger.warn('No active user found for API key');
            done(null, false);
            return;
          }

          const strategyUser: StrategyUser = {
            id: user.id,
            email: user.email,
            first_name: user.first_name ?? undefined,
            last_name: user.last_name ?? undefined,
            role: user.role,
          };

          logger.trace({user: strategyUser}, 'found user by bearer token');
          done(null, strategyUser);
        } catch (error: unknown) {
          logger.error(error);
          done(toError(error));
        }
      })();
    }),
  );

  if (
    options.github?.clientID &&
    options.github.clientSecret &&
    options.github.callbackURL
  ) {
    passport.use(
      new GithubStrategy(
        {
          clientID: options.github.clientID,
          clientSecret: options.github.clientSecret,
          callbackURL: options.github.callbackURL,
          scope: ['user:email'],
        },
        (
          accessToken: string,
          refreshToken: string,
          profile: GithubProfile,
          done: (error?: Error, user?: StrategyUser | false) => void,
        ) => {
          void (async () => {
            try {
              logger.debug({profile}, 'github profile response');

              const email = profile.emails?.[0]?.value;

              if (!email) {
                done(new Error('No email found in profile'));
                return;
              }

              const existingUser = await db
                .selectFrom('users')
                .select(['id', 'email', 'first_name', 'last_name', 'role'])
                .where('email', '=', email)
                .executeTakeFirst();

              if (existingUser) {
                done(undefined, {
                  id: existingUser.id,
                  email: existingUser.email,
                  first_name: existingUser.first_name ?? undefined,
                  last_name: existingUser.last_name ?? undefined,
                  role: existingUser.role,
                });
                return;
              }

              const firstName = profile.displayName?.split(' ')[0] ?? '';
              const lastName =
                profile.displayName?.split(' ').slice(1).join(' ') ?? '';

              if (!options.createGithubUser) {
                done(
                  new Error('createGithubUser is required for github strategy'),
                );
                return;
              }

              const createdUser = await options.createGithubUser({
                email,
                firstName,
                lastName,
                accessToken,
                refreshToken,
              });

              done(undefined, createdUser);
            } catch (error: unknown) {
              logger.error(error);
              done(toError(error));
            }
          })();
        },
      ),
    );
  }

  return passport as AuthPassport;
}

/**
 * Creates route middleware helpers bound to a configured passport instance.
 */
export function createAuthMiddleware(
  configuredPassport: AuthPassport,
): CreateAuthMiddlewareResult {
  return {
    async authenticateLocal(ctx, next) {
      await configuredPassport.authenticate('local', {
        failWithError: true,
        failureMessage: 'Invalid email or password',
        successMessage: 'Logged in',
      })(ctx, next);
    },
    async authenticateBearer(ctx, next) {
      await configuredPassport.authenticate('bearer', {session: false})(
        ctx,
        next,
      );
    },
  };
}
