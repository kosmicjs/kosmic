import type {Insertable, Selectable, Updateable} from 'kysely';
import zod from 'zod';
import {db} from '../db/index.js';
import {type GeneratedId} from './types.js';
import {renderEmailToString} from '#emails/layout.js';
import WelcomeEmail from '#emails/templates/welcome.js';

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
