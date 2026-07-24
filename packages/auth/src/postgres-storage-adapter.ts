import {PostgresDialect, Kysely, type PostgresDialectConfig} from 'kysely';
import argon2 from 'argon2';
import type {AbstractDataStorage} from './abstract-storage-adapter.ts';
import type {AuthDatabase} from './types.ts';

export class PostgresStorageAdapter implements AbstractDataStorage {
  readonly #db: Kysely<AuthDatabase>;

  constructor(config: PostgresDialectConfig | PostgresDialect) {
    const dialect =
      typeof config === 'object' && config !== null && 'pool' in config
        ? new PostgresDialect(config)
        : config;
    this.#db = new Kysely<AuthDatabase>({dialect});
  }

  async getUserById(userId: string) {
    const user = await this.#db
      .selectFrom('users')
      .select(['id', 'email', 'first_name', 'last_name', 'role', 'hash'])
      .where('id', '=', userId)
      .where('is_active', '=', true)
      .executeTakeFirstOrThrow();

    return user;
  }

  async getUserByEmail(email: string) {
    const user = await this.#db
      .selectFrom('users')
      .select(['id', 'email', 'first_name', 'last_name', 'role', 'hash'])
      .where('email', '=', email)
      .where('is_active', '=', true)
      .executeTakeFirstOrThrow();

    return user;
  }

  async getApiKeysByPrefix(keyPrefix: string) {
    const apiKeys = await this.#db
      .selectFrom('api_keys')
      .select([
        'user_id',
        'is_active',
        'expires_at',
        'id',
        'key_hash',
        'last_used_at',
      ])
      .where('key_prefix', '=', keyPrefix)
      .where('is_active', '=', true)
      .execute();

    return apiKeys;
  }

  async verifyUserPassword(hash: string, password: string) {
    return argon2.verify(hash, password);
  }

  async updateApiKeyLastUsedAt(lastUsedAt: Date) {
    //
  }
}
