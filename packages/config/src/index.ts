import z from 'zod/v4';
import type {PartialDeep} from 'type-fest';
import {env} from './env.ts';
import {configSchema} from './schema.ts';

/**
 * If you have a specific configuration for each environment, you can define it here.
 * The configuration will be merged with the defaults from the schema.
 */
const baseConfig: PartialDeep<z.infer<typeof configSchema>> = {
  db: {
    pg: {
      host: env.DB_HOST,
      user: env.DB_USER,
      database: env.DB_DATABASE,
      password: env.DB_PASSWORD,
      connectionString: env.DB_CONNECTION_STRING,
    },
  },
  stripe: {
    secretKey: env.STRIPE_SECRET_KEY,
    endpointSecret: env.STRIPE_ENDPOINT_SECRET,
    priceId: env.STRIPE_PRICE_ID,
  },
  github: {
    clientID: env.GITHUB_CLIENT_ID,
    clientSecret: env.GITHUB_CLIENT_SECRET,
    callbackURL: env.GITHUB_CALLBACK_URL,
  },
  google: {
    clientID: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    callbackURL: env.GOOGLE_CALLBACK_URL,
    geminiApiKey: env.GEMINI_API_KEY,
  },
  nodeMailer: {
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT),
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
    jsonTransport: !env.SMTP_HOST,
  },
};

const results = configSchema.safeParse(baseConfig);

if (results.error) {
  throw new Error(z.prettifyError(results.error));
}

export const config = results.data;
