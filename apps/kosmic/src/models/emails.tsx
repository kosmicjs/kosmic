import type {Insertable, Selectable, Updateable} from 'kysely';
import zod from 'zod/v4';
import type {GeneratedId} from './types.ts';
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
  const emailComponent = (
    <WelcomeEmail verificationLink="http://localhost:3000/account/verify" />
  );

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

// Email verification function for better-auth
export async function queueEmailVerification(
  userId: number,
  email: string,
  verificationUrl: string,
) {
  // You can create a specific email verification template here
  // For now, we'll use the welcome email but you might want to create a separate verification email
  const emailComponent = <WelcomeEmail verificationLink={verificationUrl} />;

  const html = await emailRenderToString(emailComponent);

  await db
    .insertInto('emails')
    .values({
      user_id: userId,
      to: email,
      from: 'noreply@kosmic.com',
      subject: 'Verify your email address',
      status: 'pending',
      html,
      description: 'Email verification',
    })
    .execute();
}

// Password reset function for better-auth
export async function queuePasswordReset(
  userId: number,
  email: string,
  resetUrl: string,
) {
  // You'll want to create a password reset email template
  // For now, using a simple HTML template
  const html = `
    <html>
      <body>
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </body>
    </html>
  `;

  await db
    .insertInto('emails')
    .values({
      user_id: userId,
      to: email,
      from: 'noreply@kosmic.com',
      subject: 'Reset your password',
      status: 'pending',
      html,
      description: 'Password reset',
    })
    .execute();
}
