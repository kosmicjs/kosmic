import type {Kysely} from 'kysely';
import type {AbstractStorageAdapter} from './abstract-storage-adapter.ts';
import type {AuthDatabase} from './types.ts';

export class KyselyStorageAdapter implements AbstractStorageAdapter {
  readonly #db: Kysely<AuthDatabase>;

  constructor(db: Kysely<AuthDatabase>) {
    this.#db = db;
  }

  async getUserById(userId: string) {
    //
  }

  async getUserByEmail(email: string) {
    //
    const user = await this.#db
      .selectFrom('users')
      .select(['id', 'email', 'first_name', 'last_name', 'role', 'hash'])
      .where('email', '=', email)
      .where('is_active', '=', true)
      .executeTakeFirstOrThrow();

    return user;
  }

  async getUserByApiKey(apiKey: string) {
    //
  }

  async verifyUserPassword(hash: string) {
    //
  }

  async updateApiKeyLastUsedAt(lastUsedAt: Date) {
    //
  }
}
