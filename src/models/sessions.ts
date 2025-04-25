import type {Insertable, Selectable, Updateable} from 'kysely';
import zod from 'zod';
import {type GeneratedId} from './types.js';

const entitySchema = zod.object({
  id: zod.number().int().positive(),
  user_id: zod.number().int().positive().nullable(),
  agent: zod.string().min(1).max(255).nullable(),
  description: zod.string().min(1).max(255).nullable(),
});

const entityPartialSchema = entitySchema.partial();

export type Entity = GeneratedId<zod.infer<typeof entitySchema>>;

export type SelectableEntity = Selectable<Entity>;

export const validateSelectableEntity = async (
  entity: unknown,
): Promise<SelectableEntity> =>
  entityPartialSchema.required().parseAsync(entity);

export type InsertableEntity = Insertable<Entity>;

export const validateInsertableEntity = async (
  entity: unknown,
): Promise<InsertableEntity> => entityPartialSchema.parseAsync(entity);

export type UpdatedableEntity = Updateable<Entity>;

export const validateUpdatedableEntity = async (
  entity: unknown,
): Promise<UpdatedableEntity> => entityPartialSchema.parseAsync(entity);
