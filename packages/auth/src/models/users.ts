import type {Insertable, Selectable, Updateable, Generated} from '@kosmic/db';
import type {Simplify} from 'type-fest';
import zod from 'zod/v4';
import {config} from '@kosmic/config';

type GeneratedId<T> = Simplify<Omit<T, 'id'> & {id: Generated<number>}>;

export const userSchema = zod.object({
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

if (config.kosmicEnv !== 'development') {
  passwordSchema
    .refine((password) => /[A-Z]/v.test(password), {
      message: 'Password must contain an uppercase letter',
    })
    .refine((password) => /[a-z]/v.test(password), {
      message: 'Password must contain a lowercase letter',
    })
    .refine((password) => /\d/v.test(password), {
      message: 'Password must contain a digit',
    })
    .refine((password) => /[!@#$%^\u0026*]/v.test(password), {
      message: 'Password must contain a special character',
    });
}

export type User = GeneratedId<zod.infer<typeof userSchema>>;
export type SelectableUser = Selectable<User>;
export type InsertableUser = Insertable<User>;
export type UpdatedableUser = Updateable<User>;

export const userInsertSchema = userSchema.partial().required({
  role: true,
  email: true,
  is_verified: true,
  is_active: true,
});

export const userUpdateSchema = userSchema.partial();
