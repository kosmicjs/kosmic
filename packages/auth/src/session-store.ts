import type {Logger} from '@kosmic/logger';
import type {Kysely} from '@kosmic/db';
import type {SessionStore, Session} from '@kosmic/server';
import type {AuthDatabase} from './models/index.ts';

export type KyselySessionStoreDb = Kysely<AuthDatabase>;

/**
 * Persists Koa sessions using a Kysely database connection.
 */
export class KyselySessionStore implements SessionStore {
  readonly #db: KyselySessionStoreDb;
  readonly #logger: Logger;

  constructor(db: KyselySessionStoreDb, logger: Logger) {
    this.#db = db;
    this.#logger = logger;
  }

  /**
   * Reads a session value from storage by key.
   */
  async get(key: string) {
    this.#logger.trace({key}, 'KyselySessionStore.get');
    const result = await this.#db
      .selectFrom('sessions')
      .select(['value'])
      .where('key', '=', key)
      .executeTakeFirst();

    return result?.value;
  }

  /**
   * Creates or updates a session row for the provided key.
   */
  async set(
    key: string,
    value: Partial<Session> & {
      _expire?: number | undefined;
      _maxAge?: number | undefined;
    },
  ) {
    this.#logger.trace({key, value}, 'KyselySessionStore.set');
    await this.#db
      .insertInto('sessions')
      .values({key, value: JSON.stringify(value)})
      .onConflict((oc) =>
        oc.column('key').doUpdateSet({
          value: JSON.stringify(value),
        }),
      )
      .execute();
  }

  /**
   * Deletes a session row by key.
   */
  async destroy(key: string) {
    this.#logger.trace({key}, 'KyselySessionStore.destroy');
    await this.#db.deleteFrom('sessions').where('key', '=', key).execute();
  }
}
