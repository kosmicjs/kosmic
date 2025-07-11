import z from 'zod/v4';
import {type PoolConfig} from 'pg';
import type JSONTransport from 'nodemailer/lib/json-transport/index.js';
import type SMTPTransport from 'nodemailer/lib/smtp-transport/index.js';
import {env, nodeEnv, kosmicEnv} from './env.js';

/**
 * The configuration schema for the application
 * The schema is used to validate the configuration and set defaults
 */
export const configSchema = z.object({
  kosmicEnv: z.literal(kosmicEnv).default(kosmicEnv),
  /** The validated value of the NODE_ENV env var */
  nodeEnv: z.literal(nodeEnv).default(nodeEnv),
  /** The port the server is started on, defaults to 3000 */
  port: z.coerce.number().prefault(env.PORT),
  /** The host the server is started on, defaults to 127.0.0.1 */
  host: z.string().default(env.SERVER_HOST),
  /** logger */
  logLevel: z.string().default(env.LOG_LEVEL),
  db: z
    .object({
      /** Passed directly to the postgres pool */
      pg: z.object({
        max: z.number().optional().default(10),
        idleTimeoutMillis: z.number().optional().default(30_000),
        connectionTimeoutMillis: z.number().optional().default(2000),
        host: z.string().optional().default(env.DB_HOST),
        user: z.string().optional().default(env.DB_USER),
        database: z.string().optional().default(env.DB_DATABASE),
        password: z.string().optional().default(env.DB_PASSWORD),
        connectionString: z
          .string()
          .optional()
          .default(env.DB_CONNECTION_STRING),
      }) satisfies z.ZodType<PoolConfig>,
    })
    .prefault({pg: {}}),
  stripe: z
    .object({
      secretKey: z.string().optional().default(env.STRIPE_SECRET_KEY),
      endpointSecret: z.string().optional().default(env.STRIPE_ENDPOINT_SECRET),
      priceId: z.string().optional().default(env.STRIPE_PRICE_ID),
    })
    .optional(),
  github: z
    .object({
      clientID: z.string().optional().default(env.GITHUB_CLIENT_ID),
      clientSecret: z.string().optional().default(env.GITHUB_CLIENT_SECRET),
      callbackURL: z.string().optional().default(env.GITHUB_CALLBACK_URL),
    })
    .optional(),
  google: z
    .object({
      clientID: z.string().optional().default(env.GOOGLE_CLIENT_ID),
      clientSecret: z.string().optional().default(env.GOOGLE_CLIENT_SECRET),
      callbackURL: z.string().optional().default(env.GOOGLE_CALLBACK_URL),
      geminiApiKey: z.string().optional().default(env.GEMINI_API_KEY),
    })
    .optional(),
  openAi: z
    .object({
      apiKey: z.string().optional().default(env.OPENAI_API_KEY),
    })
    .optional(),
  sessionKeys: z.array(z.string()).default(['kosmic-secret-keys']),
  nodeMailer: (
    z.object({
      host: z.string().optional().default(env.SMTP_HOST),
      port: z.coerce.number().optional().prefault(env.SMTP_PORT),
      auth: z
        .object({
          user: z.string().optional().default(env.SMTP_USER),
          pass: z.string().optional().default(env.SMTP_PASS),
        })
        .prefault({}),
      jsonTransport: z.boolean().optional().default(!env.SMTP_HOST),
    }) satisfies z.ZodType<SMTPTransport.Options | JSONTransport.Options>
  ).prefault({}),
  betterAuth: z
    .object({
      secret: z.string().optional().default(env.BETTER_AUTH_SECRET),
      baseURL: z.string().optional().default(env.BETTER_AUTH_URL),
    })
    .prefault({}),
});

/**
 * If you have a specific configuration for each environment, you can define it here.
 * The configuration will be merged with the defaults from the schema.
 */
const configByEnv = {
  development: {},
  production: {},
  test: {},
};

/** The configuration type with library specific overrides for types */
type Config = Omit<z.infer<typeof configSchema>, 'db' | 'nodeMailer'> & {
  db: {
    pg: PoolConfig;
  };
} & {
  nodeMailer: SMTPTransport.Options | JSONTransport.Options;
};

const results = configSchema.safeParse(configByEnv[nodeEnv]);

if (results.error) {
  throw new Error(z.prettifyError(results.error));
}

export const config: Config = results.data;
