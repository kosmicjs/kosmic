import type {Insertable, Selectable, Updateable} from 'kysely';
import zod from 'zod';
import {type GeneratedId} from './types.js';

export const rateLimitAbuseSchema = zod.object({
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

export type RateLimitAbuse = GeneratedId<
  zod.infer<typeof rateLimitAbuseSchema>
>;
export type SelectableRateLimitAbuse = Selectable<RateLimitAbuse>;
export type InsertableRateLimitAbuse = Insertable<RateLimitAbuse>;
export type UpdatedableRateLimitAbuse = Updateable<RateLimitAbuse>;

export const rateLimiterSchema = zod.object({
  key: zod.string().min(1).max(255),
  counter: zod.number().int().nonnegative(),
  date_end: zod.date(),
});

export type RateLimiter = zod.infer<typeof rateLimiterSchema>;
export type SelectableRateLimiter = Selectable<RateLimiter>;
export type InsertableRateLimiter = Insertable<RateLimiter>;
export type UpdateableRateLimiter = Updateable<RateLimiter>;
