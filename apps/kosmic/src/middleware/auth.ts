import {
  createKosmicAuth,
  type AuthDatabase,
  type CreateKosmicAuthOptions,
} from '@kosmic/auth';
import {config} from '@kosmic/config';
import type {Kysely} from '@kosmic/db';
import * as User from '#models/users.js';
import {db} from '#db/index.js';
import logger from '#utils/logger.js';

/**
 * Creates a user record from a github OAuth profile payload.
 */
async function createGithubUser(input: {
  email: string;
  firstName: string;
  lastName: string;
  accessToken: string;
  refreshToken: string;
}) {
  const user = await db
    .insertInto('users')
    .values(
      await User.schema.parseAsync({
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
}

/**
 * Builds auth strategy options while preserving exact optional property semantics.
 */
function getPassportOptions(): CreateKosmicAuthOptions['passport'] {
  const passportOptions: CreateKosmicAuthOptions['passport'] = {
    createGithubUser,
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

  return passportOptions;
}

const kosmicAuth = createKosmicAuth({
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  db: db as unknown as Kysely<AuthDatabase>,
  logger,
  passport: getPassportOptions(),
});

export const {passport} = kosmicAuth;

export const {sessionStore} = kosmicAuth;
export const {authenticateBearer} = kosmicAuth;
export const {authenticateLocal} = kosmicAuth;
