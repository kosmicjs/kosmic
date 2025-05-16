import process from 'node:process';
import path from 'node:path';
import dotenv from 'dotenv';
import z from 'zod';
import defaults from 'defaults';
import {fromError} from 'zod-validation-error';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface ProcessEnv extends z.infer<typeof envSchema> {}
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
});

// then override with specific env
dotenv.config({
  // TODO: should this use KOSMIC_ENV instead of NODE_ENV?
  path: path.resolve(import.meta.dirname, process.cwd(), `.env.${nodeEnv}`),
  processEnv: parsedEnv,
  override: true,
});

export const envSchema = z
  .object({
    PORT: z.string(),
    SERVER_HOST: z.string(),
    STRIPE_SECRET_KEY: z.string(),
    STRIPE_ENDPOINT_SECRET: z.string(),
    DB_HOST: z.string(),
    DB_DATABASE: z.string(),
    DB_USER: z.string(),
    DB_PASSWORD: z.string(),
    DB_CONNECTION_STRING: z.string(),
    SESSION_KEYS: z.string(),
    LOG_LEVEL: z.string(),
    OPENAI_API_KEY: z.string(),
    GEMINI_API_KEY: z.string(),
  })
  .partial();

// Variables set outside of the env files override the env files
const env = envSchema.parse({
  ...parsedEnv,
  ...process.env,
});

/**
 * The configuration schema for the application
 */
export const configSchema = z.object({
  kosmicEnv: z.literal(kosmicEnv),
  /** The validated value of the NODE_ENV env var */
  nodeEnv: z.literal(nodeEnv),
  /** The port the server is started on, defaults to 3000 */
  port: z.coerce.number().default(3000),
  /** The host the server is started on, defaults to 127.0.0.1 */
  host: z.string().default('127.0.0.1'),
  /** logger */
  logLevel: z.string().default('info'),
  /** Passed directly to the postgres pool */
  pg: z.intersection(
    z.object({
      max: z.number().optional(),
      idleTimeoutMillis: z.number().optional(),
      connectionTimeoutMillis: z.number().optional(),
    }),
    z.union([
      z.object({
        host: z.string().optional(),
        user: z.string().optional(),
        database: z.string().optional(),
        password: z.string().optional(),
      }),
      z.object({
        connectionString: z.string().default('postgresql://localhost'),
      }),
    ]),
  ),
  stripe: z
    .object({
      secretKey: z.string(),
      endpointSecret: z.string(),
    })
    .partial()
    .optional(),
  github: z
    .object({
      clientID: z.string(),
      clientSecret: z.string(),
      callbackURL: z.string(),
    })
    .optional(),
  google: z.object({
    clientID: z.string().optional(),
    clientSecret: z.string().optional(),
    callbackURL: z.string().optional(),
    geminyApiKey: z.string().optional(),
  }),
  openAi: z
    .object({
      apiKey: z.string().optional(),
    })
    .optional(),
  sessionKeys: z.array(z.string()).default(['kosmic-secret-keys']),
});

const configByEnv = {
  default: {
    ...env,
    kosmicEnv,
    nodeEnv,
    port: env.PORT,
    host: env.SERVER_HOST,
    sessionKeys: env.SESSION_KEYS?.split(','),
    logLevel: env.LOG_LEVEL,
    pg: {
      connectionString: env.DB_CONNECTION_STRING,
      user: env.DB_USER,
      database: env.DB_DATABASE,
      password: env.DB_PASSWORD,
      host: env.DB_HOST,
    },
    openAi: {
      apiKey: env.OPENAI_API_KEY,
    },
    google: {
      geminyApiKey: env.GEMINI_API_KEY,
    },
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 2000,
  },
  development: {
    stripe: {
      secretKey: env.STRIPE_SECRET_KEY,
      endpointSecret: env.STRIPE_ENDPOINT_SECRET,
    },
  },
  production: {
    stripe: {
      secretKey: env.STRIPE_SECRET_KEY,
      endpointSecret: env.STRIPE_ENDPOINT_SECRET,
    },
  },
  test: {
    logLevel: 'silent',
  },
};

export const config = (() => {
  try {
    const parsedConfig = configSchema.parse(
      defaults(configByEnv[nodeEnv], configByEnv.default),
    );

    return parsedConfig;
  } catch (error) {
    // too early to use logger
    // eslint-disable-next-line no-console
    console.error(fromError(error).toString());
    throw error;
  }
})();
