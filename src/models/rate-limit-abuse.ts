import type {Insertable, Selectable, Updateable} from 'kysely';
import zod from 'zod';
import {type GeneratedId} from './types.js';

const rateLimitAbuseSchema = zod.object({
  id: zod.number().int().positive(),
  user_id: zod.number().int().positive().nullable(),
  prefix: zod.string().min(1).max(255).nullable(),
  key: zod.string().min(1).max(255).nullable(),
  ip: zod.string().min(1).max(255).nullable(),
  nb_max: zod.number().int().positive().nullable(),
  nb_hit: zod.number().int().positive().nullable(),
  interval: zod.string().min(1).max(255).nullable(),
  date_end: zod.date().nullable(),
});

const rateLimitAbusePartialSchema = rateLimitAbuseSchema.partial();

export type RateLimitAbuse = GeneratedId<
  zod.infer<typeof rateLimitAbuseSchema>
>;

export type SelectableRateLimitAbuse = Selectable<RateLimitAbuse>;

export const validateSelectableRateLimitAbuse = async (
  rateLimitAbuse: unknown,
): Promise<SelectableRateLimitAbuse> =>
  rateLimitAbusePartialSchema.required().parseAsync(rateLimitAbuse);

export type InsertableRateLimitAbuse = Insertable<RateLimitAbuse>;

export const validateInsertableRateLimitAbuse = async (
  rateLimitAbuse: unknown,
): Promise<InsertableRateLimitAbuse> =>
  rateLimitAbusePartialSchema.parseAsync(rateLimitAbuse);

export type UpdatedableRateLimitAbuse = Updateable<RateLimitAbuse>;

export const validateUpdatedableRateLimitAbuse = async (
  rateLimitAbuse: unknown,
): Promise<UpdatedableRateLimitAbuse> =>
  rateLimitAbusePartialSchema.parseAsync(rateLimitAbuse);

const rateLimiterSchema = zod.object({
  key: zod.string().min(1).max(255),
  counter: zod.number().int().nonnegative(),
  date_end: zod.date(),
});

const rateLimiterPartialSchema = rateLimiterSchema.partial();

// Unlike other models, this one doesn't use GeneratedId since 'key' is the primary key
export type RateLimiter = zod.infer<typeof rateLimiterSchema>;

export type SelectableRateLimiter = Selectable<RateLimiter>;

export const validateSelectableRateLimiter = async (
  rateLimiter: unknown,
): Promise<SelectableRateLimiter> => rateLimiterSchema.parseAsync(rateLimiter);

export type InsertableRateLimiter = Insertable<RateLimiter>;

export const validateInsertableRateLimiter = async (
  rateLimiter: unknown,
): Promise<InsertableRateLimiter> => rateLimiterSchema.parseAsync(rateLimiter);

export type UpdateableRateLimiter = Updateable<RateLimiter>;

export const validateUpdateableRateLimiter = async (
  rateLimiter: unknown,
): Promise<UpdateableRateLimiter> =>
  rateLimiterPartialSchema.parseAsync(rateLimiter);
