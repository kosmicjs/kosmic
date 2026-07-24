import type {Insertable, Selectable, Updateable} from '@kosmic/db';
import zod from 'zod';
import type {GeneratedId} from './types.ts';

export const schema = zod.object({
  id: zod.number().int().positive(),
  user_id: zod.uuid().nullable(),
  name: zod.string().min(1).max(255).nullable(),
  description: zod.string().max(255).nullable(),
});

export type Job = GeneratedId<zod.infer<typeof schema>>;
export type SelectableJob = Selectable<Job>;
export type InsertableJob = Insertable<Job>;
export type UpdatedableJob = Updateable<Job>;
