import type {Insertable, Selectable, Updateable} from 'kysely';
import zod from 'zod/v4';
import type {GeneratedId} from './types.ts';

export const schema = zod.object({
  id: zod.number().int().positive(),
  user_id: zod.number().int().positive().nullable(),
  name: zod.string().min(1).max(255).nullable(),
  description: zod.string().max(255).nullable(),
});

export type Entity = GeneratedId<zod.infer<typeof schema>>;
export type SelectableEntity = Selectable<Entity>;
export type InsertableEntity = Insertable<Entity>;
export const insertSchema = schema.partial();
export type UpdatedableEntity = Updateable<Entity>;
export const updateSchema = schema.partial();
