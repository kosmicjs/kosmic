import process from 'node:process';
import path from 'node:path';
import dotenv from 'dotenv';
import z from 'zod/v4';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envSchema> {
      NODE_ENV: 'development' | 'production' | 'test';
      KOSMIC_ENV: 'development' | 'production' | 'migration' | 'test';
    }
  }
}

export const nodeEnv = z
  .enum(['development', 'production', 'test'])
  .default('development')
  .parse(process.env.NODE_ENV);

export const kosmicEnv = z
  .enum(['development', 'production', 'migration', 'test'])
  .default('development')
  .parse(process.env.KOSMIC_ENV);

const parsedEnv: Record<string, string> = {};

const envPath = path.resolve(import.meta.dirname, process.cwd(), `.env`);

// laod .env first
dotenv.config({
  path: envPath,
  processEnv: parsedEnv,
  quiet: true,
});

const envPathSpecific = path.resolve(
  import.meta.dirname,
  process.cwd(),
  `.env.${kosmicEnv}`,
);

// then override with specific env
dotenv.config({
  path: envPathSpecific,
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
  SMTP_PORT: z.string().optional().default('587'),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
});

const result = envSchema.safeParse({
  ...parsedEnv,
  ...process.env,
});

if (result.error) {
  throw new Error(z.prettifyError(result.error));
}

export const env = result.data;

process.env = {
  ...env,
  ...process.env,
};
