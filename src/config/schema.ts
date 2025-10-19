import z from 'zod/v4';
import {type PoolConfig} from 'pg';
import type JSONTransport from 'nodemailer/lib/json-transport/index.js';
import type SMTPTransport from 'nodemailer/lib/smtp-transport/index.js';
import {env, nodeEnv, kosmicEnv} from './env.js';

const envVar = z.string().or(z.undefined());

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
        host: envVar,
        user: envVar,
        database: envVar,
        password: envVar,
        connectionString: envVar,
      }) satisfies z.ZodType<PoolConfig>,
    })
    .or(z.undefined()),
  stripe: z
    .object({
      secretKey: envVar,
      endpointSecret: envVar,
      priceId: envVar,
    })
    .optional(),
  github: z
    .object({
      clientID: envVar,
      clientSecret: envVar,
      callbackURL: envVar,
    })
    .or(z.undefined()),
  google: z
    .object({
      clientID: envVar,
      clientSecret: envVar,
      callbackURL: envVar,
      geminiApiKey: envVar,
    })
    .or(z.undefined()),
  openAi: z
    .object({
      apiKey: envVar,
    })
    .or(z.undefined()),
  sessionKeys: z.array(z.string()).default(['kosmic-secret-keys']),
  nodeMailer: (
    z.object({
      host: envVar,
      port: z.coerce.number().optional().prefault(env.SMTP_PORT),
      auth: z
        .object({
          user: envVar,
          pass: envVar,
        })
        .optional(),
      jsonTransport: z.boolean().optional().default(!env.SMTP_HOST),
    }) satisfies z.ZodType<SMTPTransport.Options | JSONTransport.Options>
  ).or(z.undefined()),
});
