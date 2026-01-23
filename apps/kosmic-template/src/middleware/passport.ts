// import process from 'node:process';
import passport from 'koa-passport';
import {Strategy as LocalStrategy} from 'passport-local';
import {Strategy as BearerStategy} from 'passport-http-bearer';
// import {
//   Strategy as GoogleStrategy,
//   type Profile,
//   type VerifyCallback,
// } from 'passport-google-oauth20';
import {Strategy as GithubStrategy} from 'passport-github2';
import argon2 from 'argon2';
import type {SelectableUser} from '#models/users.js';
import {db} from '#db/index.js';
import logger from '#utils/logger.js';
import {config} from '#config/index.js';
import * as User from '#models/users.js';
import {extractKeyPrefix} from '#models/api-keys.js';

declare module 'koa' {
  interface DefaultState {
    user?: SelectableUser;
  }
}

// @ts-expect-error crappy 3rd party type
passport.serializeUser((user: SelectableUser, done) => {
  logger.debug({user}, 'serializing user');
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await db
      .selectFrom('users')
      .select(['id', 'email', 'first_name', 'last_name', 'role'])
      .where('id', '=', id)
      .executeTakeFirstOrThrow();

    logger.trace({user}, 'deserialized user');

    if (user) done(null, user);
    else done(null, false);
  } catch (error: unknown) {
    logger.error(error);
    done(error, {message: 'User not found'});
  }
});

passport.use(
  'local',
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        if (!email) {
          throw new Error('Username is required');
        }

        if (!password) {
          throw new Error('Password is required');
        }

        const user = await db
          .selectFrom('users')
          .select(['id', 'email', 'first_name', 'last_name', 'hash'])
          .where('email', '=', email)
          .executeTakeFirst();

        if (user?.hash && !(await argon2.verify(user?.hash, password))) {
          throw new Error('Invalid email or password');
        }

        if (user) done(null, user);
        else done(null, false);
      } catch (error: unknown) {
        logger.error(error);
        done(null, false);
      }
    },
  ),
);

// ...existing code...

passport.use(
  'bearer',
  new BearerStategy(async (token, done) => {
    try {
      logger.debug({token}, 'bearer token received');

      // Extract the prefix from the token (assuming format like "kos_abc123...")
      const keyPrefix = extractKeyPrefix(token);

      if (!keyPrefix) {
        logger.warn('Invalid API key format');
        done(null, false);
        return;
      }

      // Find API keys with matching prefix
      const apiKeys = await db
        .selectFrom('api_keys')
        .select(['user_id', 'is_active', 'expires_at', 'id', 'key_hash'])
        .where('key_prefix', '=', keyPrefix)
        .where('is_active', '=', true)
        .execute();

      let validApiKey = null;

      // Verify the token against each potential match
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

      // Check if the API key has expired
      if (
        validApiKey.expires_at &&
        new Date(validApiKey.expires_at) < new Date()
      ) {
        logger.warn('API key has expired');
        done(null, false);
        return;
      }

      // Update last_used_at timestamp
      await db
        .updateTable('api_keys')
        .set({last_used_at: new Date()})
        .where('id', '=', validApiKey.id)
        .execute();

      // Get the associated user
      const user = await db
        .selectFrom('users')
        .select(['id', 'email', 'first_name', 'last_name', 'role'])
        .where('id', '=', validApiKey.user_id)
        .where('is_active', '=', true)
        .executeTakeFirst();

      if (user) {
        logger.trace({user}, 'found user by bearer token');
        done(null, user);
      } else {
        logger.warn('No active user found for API key');
        done(null, false);
      }
    } catch (error: unknown) {
      logger.error(error);
      done(error);
    }
  }),
);

// ...existing code...

if (
  config.github?.clientID &&
  config.github.clientSecret &&
  config.github.callbackURL
) {
  passport.use(
    new GithubStrategy(
      {
        clientID: config.github.clientID,
        clientSecret: config.github.clientSecret,
        callbackURL: config.github.callbackURL,
        scope: ['user:email'],
      },
      async function (
        accessToken: string,
        refreshToken: string,
        profile: {emails: Array<{value: string}>; displayName: string},
        done: (
          err: Error | undefined,
          user?: Pick<
            SelectableUser,
            'id' | 'email' | 'first_name' | 'last_name'
          >,
        ) => void,
      ) {
        logger.debug(
          {accessToken, refreshToken, profile},
          'github profile response',
        );

        const email = profile.emails?.[0]?.value;

        if (!email) {
          done(new Error('No email found in profile'));
          return;
        }

        let user = await db
          .selectFrom('users')
          .select(['id', 'email', 'first_name', 'last_name'])
          .where('email', '=', email)
          .executeTakeFirst();

        if (user) {
          done(undefined, user);
          return;
        }

        try {
          user = await db
            .insertInto('users')
            .values(
              await User.schema.parseAsync({
                first_name: profile.displayName?.split(' ')[0] ?? '',
                role: 'user',
                last_name:
                  profile.displayName?.split(' ').slice(1).join(' ') || '',
                email,
                github_access_token: accessToken,
                github_refresh_token: refreshToken,
              }),
            )
            .returningAll()
            .executeTakeFirstOrThrow();
        } catch (error) {
          if (error instanceof Error) {
            logger.error(error);
            done(error);
            return;
          }

          throw error;
        }

        done(undefined, user);
      },
    ),
  );
}

// eslint-disable-next-line unicorn/prefer-export-from
export {passport};
