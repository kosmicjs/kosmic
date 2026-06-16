import type {Insertable, Selectable, Updateable} from '@kosmic/db';
import zod from 'zod/v4';

export const sessionSchema = zod.object({
  key: zod.string().min(1).max(255),
  value: zod.string(),
  user_id: zod.number().int().positive().nullable(),
  expires_at: zod.date().nullable(),
});

export type SessionRow = zod.infer<typeof sessionSchema>;
export type SelectableSessionRow = Selectable<SessionRow>;
export type InsertableSessionRow = Insertable<SessionRow>;
export type UpdatedableSessionRow = Updateable<SessionRow>;
