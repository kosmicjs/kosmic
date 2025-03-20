import type {Insertable, Selectable, Updateable} from 'kysely';
import zod from 'zod';
import {type GeneratedId} from './types.js';

const schema = zod.object({
  id: zod.number().int().positive(),
  first_name: zod.string().max(255).nullable(),
  last_name: zod.string().max(255).nullable(),
  phone: zod.string().max(255).nullable(),
  email: zod.string().max(255).email().nullable(),
  hash: zod.string().max(255).nullable(),
  google_access_token: zod.string().max(255).nullable(),
  google_refresh_token: zod.string().max(255).nullable(),
  github_access_token: zod.string().max(255).nullable(),
  github_refresh_token: zod.string().max(255).nullable(),
});

export type User = GeneratedId<zod.infer<typeof schema>>;

export type SelectableUser = Selectable<User>;

export const validateSelectableUser = async (
  user: unknown,
): Promise<SelectableUser> => schema.parseAsync(user);

export type InsertableUser = Insertable<User>;

export const validateInsertableUser = async (
  user: unknown,
): Promise<InsertableUser> => schema.parseAsync(user);

export type UpdatedableUser = Updateable<User>;

export const validateUpdatedableUser = async (
  user: unknown,
): Promise<UpdatedableUser> => schema.parseAsync(user);
