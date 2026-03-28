import type {Insertable, Selectable, Generated} from '@kosmic/db';
import type {Simplify} from 'type-fest';
import {z as zod} from 'zod';
import argon2 from 'argon2';

type GeneratedId<T> = Simplify<Omit<T, 'id'> & {id: Generated<number>}>;
export const apiKeySchema = zod.object({
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

export const apiKeyInsertSchema = apiKeySchema.omit({
  created_at: true,
  updated_at: true,
});

export type ApiKey = GeneratedId<zod.infer<typeof apiKeySchema>>;
export type SelectableApiKey = Selectable<ApiKey>;
export type InsertableApiKey = Insertable<ApiKey>;

/**
 * Generates a secure API key and a hashed representation suitable for storage.
 */
export async function generateApiKey(): Promise<{
  apiKey: string;
  keyPrefix: string;
  keyHash: string;
}> {
  const randomBytes = crypto.getRandomValues(new Uint8Array(32));
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
 * Extracts the stable lookup prefix from an API key.
 */
export function extractKeyPrefix(apiKey: string): string | undefined {
  const parts = apiKey.split('_');

  if (parts.length < 2 || !parts[1]) {
    return undefined;
  }

  const prefix = parts[0];
  const identifier = parts[1].slice(0, 8);

  return `${prefix}_${identifier}`;
}
