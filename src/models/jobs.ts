import type {Insertable, Selectable, Updateable} from 'kysely';
import zod from 'zod';
import {type GeneratedId} from './types.js';

const jobSchema = zod.object({
  id: zod.number().int().positive(),
  user_id: zod.number().int().positive().nullable(),
  name: zod.string().min(1).max(255).nullable(),
  description: zod.string().max(255).nullable(),
});

const jobPartialSchema = jobSchema.partial();

export type Job = GeneratedId<zod.infer<typeof jobSchema>>;

export type SelectableJob = Selectable<Job>;

export const validateSelectablejob = async (
  job: unknown,
): Promise<SelectableJob> => jobPartialSchema.required().parseAsync(job);

export type InsertableJob = Insertable<Job>;

export const validateInsertableJob = async (
  job: unknown,
): Promise<InsertableJob> => jobPartialSchema.parseAsync(job);

export type UpdatedableJob = Updateable<Job>;

export const validateUpdatedablejob = async (
  job: unknown,
): Promise<UpdatedableJob> => jobPartialSchema.parseAsync(job);
