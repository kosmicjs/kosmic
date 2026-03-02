import type {Insertable, Selectable, Updateable} from 'kysely';
import zod from 'zod/v4';
import {config} from '@kosmic/config';
import type {GeneratedId} from './types.ts';

export const schema = zod.object({
  id: zod.number().int().positive(),
  role: zod.enum(['admin', 'user']).default('user'),
  first_name: zod.string().max(255).nullable(),
  last_name: zod.string().max(255).nullable(),
  phone: zod.string().max(255).nullable(),
  email: zod.email().max(255),
  hash: zod.string().max(255).nullable(),
  api_key: zod.string().max(255).nullable(),
  is_verified: zod.boolean().default(false),
  verification_token: zod.uuid().nullable(),
  verification_token_expires_at: zod.date().nullable(),
  is_active: zod.boolean().default(true),
  google_access_token: zod.string().max(255).nullable(),
  google_refresh_token: zod.string().max(255).nullable(),
  github_access_token: zod.string().max(255).nullable(),
  github_refresh_token: zod.string().max(255).nullable(),
});

export const passwordSchema = zod.string().min(8).max(255);

// For development, we allow any password for testing purposes
if (config.kosmicEnv !== 'development') {
  passwordSchema
    .refine((password) => /[A-Z]/.test(password), {
      message: 'Password must contain an uppercase letter',
    })
    .refine((password) => /[a-z]/.test(password), {
      message: 'Password must contain a lowercase letter',
    })
    .refine((password) => /\d/.test(password), {
      message: 'Password must contain a digit',
    })
    .refine((password) => /[!@#$%^&*]/.test(password), {
      message: 'Password must contain a special character',
    });
}

export type User = GeneratedId<zod.infer<typeof schema>>;

export type SelectableUser = Selectable<User>;

export type InsertableUser = Insertable<User>;

export const insertSchema = schema.partial().required({
  role: true,
  email: true,
  is_verified: true,
  is_active: true,
});

export type UpdatedableUser = Updateable<User>;

export const updateSchema = schema.partial();
