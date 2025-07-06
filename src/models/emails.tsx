import type {Insertable, Selectable, Updateable} from 'kysely';
import zod from 'zod/v4';
import {type GeneratedId} from './types.js';
import {db} from '#db/index.js';
import {renderToString as emailRenderToString} from '#emails/helpers/index.js';
import WelcomeEmail from '#emails/welcome.js';

export const schema = zod.object({
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

export type Email = GeneratedId<zod.infer<typeof schema>>;
export type SelectableEmail = Selectable<Email>;
export type InsertableEmail = Insertable<Email>;
export type UpdatedableEmail = Updateable<Email>;

// Example function to queue a welcome email
export async function queueWelcomeEmail(userId: number, email: string) {
  const emailComponent = <WelcomeEmail />;

  const html = await emailRenderToString(emailComponent);

  await db
    .insertInto('emails')
    .values({
      user_id: userId,
      to: email,
      from: 'welcome@your-app.com',
      subject: 'Welcome to Kosmic',
      status: 'pending',
      html,
    })
    .execute();
}
