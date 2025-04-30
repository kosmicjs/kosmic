// import process from 'node:process';
import passport from 'koa-passport';
import {Strategy as LocalStrategy} from 'passport-local';
// import {
//   Strategy as GoogleStrategy,
//   type Profile,
//   type VerifyCallback,
// } from 'passport-google-oauth20';
import {Strategy as GithubStrategy} from 'passport-github2';
import argon2 from 'argon2';
import {type SelectableUser} from '#models/users.js';
import {db} from '#db/index.js';
import logger from '#utils/logger.js';
import {config} from '#config/index.js';

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
      .select(['id', 'email', 'first_name', 'last_name'])
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

if (config.github) {
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
        done: (err: Error | undefined, user?: SelectableUser) => void,
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
          .selectAll()
          .where('email', '=', email)
          .executeTakeFirst();

        if (user) {
          done(undefined, user);
          return;
        }

        try {
          user = await db
            .insertInto('users')
            .values({
              first_name: profile.displayName?.split(' ')[0] || '',
              last_name:
                profile.displayName?.split(' ').slice(1).join(' ') || '',
              email,
              github_access_token: accessToken,
              github_refresh_token: refreshToken,
            })
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
