import type {Insertable, Selectable, Updateable} from 'kysely';
import zod from 'zod';
import {type GeneratedId} from './types.js';
import {db} from '#db/index.js';
import {renderEmailToString} from '#emails/layout.js';
import WelcomeEmail from '#emails/templates/welcome.js';

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
export async function queueWelcomeEmail(
  userId: number,
  email: string,
  name: string,
) {
  const emailComponent = <WelcomeEmail userName={name} />;
  const emailHtml = renderEmailToString(emailComponent);

  await db
    .insertInto('emails')
    .values({
      user_id: userId,
      to: email,
      from: 'welcome@your-app.com',
      subject: 'Welcome to Kosmic',
      html: emailHtml,
      text: generatePlainText(name),
      status: 'pending',
    })
    .execute();
}

function generatePlainText(name: string): string {
  return `
Hello ${name}!

Thank you for signing up for Kosmic. We're excited to have you on board!

To get started, please verify your email address by visiting this link:

If you have any questions, feel free to reply to this email.

Best regards,
The Kosmic Team
`.trim();
}
