import passport from 'koa-passport';
import argon2 from 'argon2';
import {Strategy as LocalStrategy} from 'passport-local';
import {Strategy as BearerStrategy} from 'passport-http-bearer';
import type {Kysely} from '@kosmic/db';
import {loggerStorage, type Logger, logger as _logger} from '@kosmic/logger';
import {
  type AuthDatabase,
  extractKeyPrefix,
  type SelectableUser,
} from './models/index.ts';

type AuthPassportDb = Pick<Kysely<AuthDatabase>, 'selectFrom' | 'updateTable'>;

export type Options = {
  db: AuthPassportDb;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface User extends Pick<
      SelectableUser,
      'id' | 'email' | 'first_name' | 'last_name' | 'role'
    > {}
  }
}

/**
 * Creates and configures a passport instance with local, bearer, and optional github strategies.
 */
export function createPassport(options: Options): typeof passport {
  const {db} = options;

  passport.serializeUser((user, done) => {
    const logger = loggerStorage.getStore() ?? _logger;
    logger.debug({user}, 'serializing user');
    done(null, user.id);
  });

  passport.deserializeUser((id: number, done) => {
    void (async () => {
      const logger = loggerStorage.getStore() ?? _logger;

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
        // @ts-expect-error - done expects an error as the first argument, but we want to pass a message
        done(error, {message: 'User not found'});
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
          const logger = loggerStorage.getStore() ?? _logger;
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
        const logger = loggerStorage.getStore() ?? _logger;
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

          logger.trace({user}, 'found user by bearer token');
          done(null, user);
        } catch (error: unknown) {
          logger.error(error);
          done(error);
        }
      })();
    }),
  );

  return passport;
}
