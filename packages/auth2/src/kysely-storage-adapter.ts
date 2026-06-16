import type {Kysely} from 'kysely';
import argon2 from 'argon2';
import type {AbstractStorageAdapter} from './abstract-storage-adapter.ts';
import type {AuthDatabase} from './types.ts';

export class KyselyStorageAdapter implements AbstractStorageAdapter {
  readonly #db: Kysely<AuthDatabase>;

  constructor(db: Kysely<AuthDatabase>) {
    this.#db = db;
  }

  async getUserById(userId: string | number) {
    const user = await this.#db
      .selectFrom('users')
      .select(['id', 'email', 'first_name', 'last_name', 'role', 'hash'])
      .where('id', '=', Number(userId))
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
