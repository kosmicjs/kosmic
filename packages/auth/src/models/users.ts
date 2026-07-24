import process from 'node:process';
import type {Insertable, Selectable, Updateable, Generated} from 'kysely';
import type {Simplify} from 'type-fest';
import zod from 'zod';

type GeneratedId<T> = Simplify<Omit<T, 'id'> & {id: Generated<string>}>;

export const userSchema = zod.object({
  id: zod.uuid(),
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

if (process.env.KOSMIC_ENV !== 'development') {
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
    .refine((password) => /[!#$%\u{26}*@^]/v.test(password), {
      message: 'Password must contain a special character',
    });
}

export type User = GeneratedId<zod.infer<typeof userSchema>>;
export type SelectableUser = Selectable<Partial<User>>;
export type InsertableUser = Insertable<User>;
export type UpdatedableUser = Updateable<User>;

export const insertSchema = userSchema.partial().extend({
  email: userSchema.shape.email,
  role: userSchema.shape.role.default('user'),
  is_verified: userSchema.shape.is_verified.default(false),
  is_active: userSchema.shape.is_active.default(true),
});

export const updateSchema = userSchema.partial();
