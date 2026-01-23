import type {Insertable, Selectable, Updateable} from 'kysely';
import zod from 'zod/v4';

export const schema = zod.object({
  key: zod.string().min(1).max(255),
  value: zod.string(),
  // zod.record(zod.string(), zod.any()) ,
  user_id: zod.number().int().positive().nullable(),
  expires_at: zod.date().nullable(),
});

export type Sessions = zod.infer<typeof schema>;
export type SelectableSessions = Selectable<Sessions>;
export type InsertableSessions = Insertable<Sessions>;
export type UpdatedableSessions = Updateable<Sessions>;
