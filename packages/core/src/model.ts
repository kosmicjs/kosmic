import type {Kysely} from 'kysely';
import type zod from 'zod';

export abstract class KosmicModel<T, DB extends Kysely<any> = Kysely<T>> {
  db?: DB | undefined;

  abstract schema: zod.ZodType<T>;

  constructor(db?: DB) {
    this.db = db;
  }
}
