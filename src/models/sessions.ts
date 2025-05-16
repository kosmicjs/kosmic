import type {Insertable, Selectable, Updateable} from 'kysely';
import zod from 'zod';

const sessionsSchema = zod.object({
  key: zod.string().min(1).max(255),
  value: zod.record(zod.string(), zod.any()),
  user_id: zod.number().int().positive().nullable(),
  expires_at: zod.date().nullable(),
});

export type Sessions = zod.infer<typeof sessionsSchema>;

export type SelectableSessions = Selectable<Sessions>;

export const validateSelectableSessions = async (
  sessions: unknown,
): Promise<SelectableSessions> =>
  sessionsSchema.required().parseAsync(sessions);

export type InsertableSessions = Insertable<Sessions>;

export const validateInsertableSessions = async (
  sessions: unknown,
): Promise<InsertableSessions> =>
  sessionsSchema
    .partial()
    .required({key: true, value: true})
    .parseAsync(sessions);

export type UpdatedableSessions = Updateable<Sessions>;

export const validateUpdatedableSessions = async (
  sessions: unknown,
): Promise<UpdatedableSessions> => sessionsSchema.parseAsync(sessions);
