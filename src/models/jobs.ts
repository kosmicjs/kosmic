import type {Insertable, Selectable, Updateable} from 'kysely';
import zod from 'zod/v4';
import {type GeneratedId} from './types.js';

export const schema = zod.object({
  id: zod.number().int().positive(),
  user_id: zod.number().int().positive().nullable(),
  name: zod.string().min(1).max(255).nullable(),
  description: zod.string().max(255).nullable(),
});

export type Job = GeneratedId<zod.infer<typeof schema>>;
export type SelectableJob = Selectable<Job>;
export type InsertableJob = Insertable<Job>;
export type UpdatedableJob = Updateable<Job>;
