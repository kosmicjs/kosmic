import type {Insertable, Selectable, Updateable} from 'kysely';
import zod from 'zod';
import {type GeneratedId} from './types.js';

export const schema = zod.object({
  id: zod.number().int().positive(),
  role: zod.enum(['admin', 'user']).default('user'),
  first_name: zod.string().max(255).nullable(),
  last_name: zod.string().max(255).nullable(),
  phone: zod.string().max(255).nullable(),
  email: zod.string().max(255).email(),
  hash: zod.string().max(255).nullable(),
  is_verified: zod.boolean().default(false),
  verification_token: zod.string().uuid().nullable(),
  verification_token_expires_at: zod.date().nullable(),
  is_active: zod.boolean().default(true),
  google_access_token: zod.string().max(255).nullable(),
  google_refresh_token: zod.string().max(255).nullable(),
  github_access_token: zod.string().max(255).nullable(),
  github_refresh_token: zod.string().max(255).nullable(),
});

export type User = GeneratedId<zod.infer<typeof schema>>;
export type SelectableUser = Selectable<User>;
export type InsertableUser = Insertable<User>;
export type UpdatedableUser = Updateable<User>;
