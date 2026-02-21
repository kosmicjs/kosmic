import type {SessionStore, Session} from '@kosmic/server';
import {db} from '#db/index.js';
import {logger} from '#utils/logger.js';

export class KyselySessionStore implements SessionStore {
  async get(key: string) {
    logger.trace({key}, 'KyselySessionStore.get');
    const result = await db
      .selectFrom('sessions')
      .selectAll()
      .where('key', '=', key)
      .executeTakeFirst();

    return result?.value;
  }

  async set(
    key: string,
    value: Partial<Session> & {
      _expire?: number | undefined;
      _maxAge?: number | undefined;
    },
  ) {
    logger.trace({key, value}, 'KyselySessionStore.set');
    await db
      .insertInto('sessions')
      .values({key, value: JSON.stringify(value)})
      .onConflict((oc) =>
        oc.column('key').doUpdateSet({
          value: JSON.stringify(value),
        }),
      )
      .execute();
  }

  async destroy(key: string) {
    logger.trace({key}, 'KyselySessionStore.destroy');
    await db.deleteFrom('sessions').where('key', '=', key).execute();
  }
}
