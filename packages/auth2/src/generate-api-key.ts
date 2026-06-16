import argon2 from 'argon2';

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
 * Extract the prefix from an API key for identification
 */
export function extractKeyPrefix(apiKey: string): string | undefined {
  const parts = apiKey.split('_');
  if (parts.length < 2 || !parts[1]) return undefined;

  const prefix = parts[0];
  const identifier = parts[1].slice(0, 8);

  return `${prefix}_${identifier}`;
}
