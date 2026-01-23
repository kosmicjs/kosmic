import {type Insertable, type Selectable} from 'kysely';
import {z as zod} from 'zod';
import argon2 from 'argon2';
import {type GeneratedId} from './types.js';

export const schema = zod.object({
  user_id: zod.number(),
  name: zod.string().min(1).max(255),
  key_prefix: zod.string().min(1).max(50),
  key_hash: zod.string().min(1),
  last_used_at: zod.date().nullable(),
  expires_at: zod.date().nullable(),
  is_active: zod.boolean(),
  permissions: zod.any().nullable(),
  created_at: zod.date().optional(),
  updated_at: zod.date().optional(),
});

export const insertSchema = schema.omit({
  created_at: true,
  updated_at: true,
});

export type ApiKey = GeneratedId<zod.infer<typeof schema>>;
export type SelectableApiKey = Selectable<ApiKey>;
export type InsertableApiKey = Insertable<ApiKey>;

/**
 * Generate a secure API key with proper format
 * Format: kos_base62(random32bytes)
 * Example: kos_1A2B3C4D5E6F7G8H9J0K1L2M3N4P5Q6R7S8T9U0V1W2X3Y4Z5
 */
export async function generateApiKey(): Promise<{
  apiKey: string;
  keyPrefix: string;
  keyHash: string;
}> {
  // Generate 32 random bytes for high entropy
  const randomBytes = crypto.getRandomValues(new Uint8Array(32));

  // Convert to base62 for URL-safe characters
  const base62Chars =
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';

  for (const byte of randomBytes) {
    result += base62Chars[byte % 62];
  }

  const keyPrefix = `kos_${result.slice(0, 8)}`;

  const apiKey = `${keyPrefix}${result.slice(8)}`;

  return {
    apiKey,
    keyPrefix,
    keyHash: await argon2.hash(apiKey),
  };
}

/**
 * Extract the prefix from an API key for identification
 */
export function extractKeyPrefix(apiKey: string): string | undefined {
  const parts = apiKey.split('_');
  if (parts.length < 2 || !parts[1]) return undefined;

  const prefix = parts[0];
  const identifier = parts[1].slice(0, 8);

  return `${prefix}_${identifier}`;
}
