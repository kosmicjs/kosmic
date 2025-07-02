import process from 'node:process';
import path from 'node:path';
import dotenv from 'dotenv';
import z from 'zod/v4';
import {type PoolConfig} from 'pg';
import type JSONTransport from 'nodemailer/lib/json-transport/index.js';
import type SMTPTransport from 'nodemailer/lib/smtp-transport/index.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envSchema> {
      NODE_ENV: 'development' | 'production' | 'test';
      KOSMIC_ENV: 'development' | 'production' | 'migration' | 'test';
    }
  }
}

const nodeEnv = z
  .enum(['development', 'production', 'test'])
  .default('development')
  .parse(process.env.NODE_ENV);

const kosmicEnv = z
  .enum(['development', 'production', 'migration', 'test'])
  .default('development')
  .parse(process.env.KOSMIC_ENV);

const parsedEnv: Record<string, string> = {};

// laod .env first
dotenv.config({
  path: path.resolve(import.meta.dirname, process.cwd(), `.env`),
  processEnv: parsedEnv,
  quiet: true,
});

// then override with specific env
dotenv.config({
  path: path.resolve(import.meta.dirname, process.cwd(), `.env.${kosmicEnv}`),
  processEnv: parsedEnv,
  override: true,
  quiet: true,
});

export const envSchema = z.object({
  PORT: z.string().default('3000'),
  SERVER_HOST: z.string().default('127.0.0.1'),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_ENDPOINT_SECRET: z.string().optional(),
  STRIPE_PRICE_ID: z.string().optional(),
  DB_HOST: z.string().optional(),
  DB_DATABASE: z.string().optional(),
  DB_USER: z.string().optional(),
  DB_PASSWORD: z.string().optional(),
  DB_CONNECTION_STRING: z.string().optional(),
  SESSION_KEYS: z.string().optional(),
  LOG_LEVEL: z.string().default('info'),
  OPENAI_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GITHUB_CALLBACK_URL: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
});

// Variables set outside of the env files override the env files
const env = envSchema.parse({
  ...parsedEnv,
  ...process.env,
});

/**
 * The configuration schema for the application
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
});

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

export const config: Config = (() => {
  const parsedConfig: z.infer<typeof configSchema> = configSchema.parse(
    configByEnv[nodeEnv],
  );

  return parsedConfig;
})();
