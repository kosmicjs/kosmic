import passport from 'koa-passport';
import argon2 from 'argon2';
import {Strategy as LocalStrategy} from 'passport-local';
import {Strategy as BearerStrategy} from 'passport-http-bearer';
import {getLogger} from '@kosmic/logger';
import {extractKeyPrefix} from './generate-api-key.ts';
import type {AbstractDataStorage} from './abstract-storage-adapter.ts';
/**
 * Creates and configures a passport instance with local, bearer, and optional github strategies.
 */
export function createPassport(storage: AbstractDataStorage): typeof passport {
  passport.serializeUser((user, done) => {
    const logger = getLogger();
    logger.debug({user}, 'serializing user');
    // @ts-expect-error - types here are weirdly tied to express
    done(null, user.id);
  });

  passport.deserializeUser((id: number, done) => {
    void (async () => {
      const logger = getLogger();

      try {
        const user = await storage.getUserById(id);

        const {hash, ...safeUser} = user;

        logger.trace({user: safeUser}, 'deserialized user');

        if (user) {
          done(null, safeUser);
          return;
        }

        done(null, false);
      } catch (error: unknown) {
        logger.error(error);
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
          const logger = getLogger();
          try {
            if (!email) {
              throw new Error('Username is required');
            }

            if (!password) {
              throw new Error('Password is required');
            }

            const user = await storage.getUserByEmail(email);

            if (
              !user?.hash ||
              !(await storage.verifyUserPassword(user.hash, password))
            ) {
              done(null, false);
              return;
            }

            const {hash, ...safeUser} = user;

            logger.trace(
              {user: safeUser},
              'authenticated user with local strategy',
            );

            done(null, safeUser);
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
        const logger = getLogger();
        try {
          logger.debug({token}, 'bearer token received');
          const keyPrefix = extractKeyPrefix(token);

          if (!keyPrefix) {
            logger.warn('Invalid API key format');
            done(null, false);
            return;
          }

          const apiKeys = await storage.getApiKeysByPrefix(keyPrefix);

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

          await storage.updateApiKeyLastUsedAt(new Date());

          const user = await storage.getUserById(validApiKey.user_id);

          if (!user) {
            logger.warn('No active user found for API key');
            done(null, false);
            return;
          }

          const {hash, ...safeUser} = user;

          logger.trace({user: safeUser}, 'found user by bearer token');

          done(null, safeUser);
        } catch (error: unknown) {
          logger.error(error);
          done(error);
        }
      })();
    }),
  );

  return passport;
}
