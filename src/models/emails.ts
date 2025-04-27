import type {Insertable, Selectable, Updateable} from 'kysely';
import zod from 'zod';
import {type GeneratedId} from './types.js';

const emailSchema = zod.object({
  id: zod.number().int().positive(),
  user_id: zod.number().int().positive().nullable(),
  sent_at: zod.date().nullable(),
  html: zod.string().max(255).nullable(),
  to: zod.string().max(255).nullable(),
  from: zod.string().max(255).nullable(),
  subject: zod.string().max(255).nullable(),
  text: zod.string().max(255).nullable(),
  attachments: zod.string().max(255).nullable(),
  status: zod.enum(['pending', 'sent', 'failed']).nullable(),
  description: zod.string().max(255).nullable(),
});

const emailPartialSchema = emailSchema.partial();

export type Email = GeneratedId<zod.infer<typeof emailSchema>>;

export type SelectableEmail = Selectable<Email>;

export const validateSelectableEmail = async (
  email: unknown,
): Promise<SelectableEmail> => emailPartialSchema.required().parseAsync(email);

export type InsertableEmail = Insertable<Email>;

export const validateInsertableEmail = async (
  email: unknown,
): Promise<InsertableEmail> => emailPartialSchema.parseAsync(email);

export type UpdatedableEmail = Updateable<Email>;

export const validateUpdatedableEmail = async (
  email: unknown,
): Promise<UpdatedableEmail> => emailPartialSchema.parseAsync(email);
