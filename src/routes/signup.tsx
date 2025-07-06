import type {Context, Next} from 'koa';
import argon2 from 'argon2';
import z, {string} from 'zod/v4';
import * as User from '#models/users.js';
import {SignupForm} from '#components/signup-form.js';
import Layout from '#components/layout.js';
import * as Emails from '#models/emails.js';
import {db} from '#db/index.js';

export async function get(ctx: Context, next: Next) {
  await ctx.render(
    <Layout>
      <div class="row d-flex justify-content-center align-items-center">
        <div class="col-12 col-sm-8 col-md-6 col-lg-4">
          <SignupForm />
        </div>
      </div>
    </Layout>,
  );
}

export async function post(ctx: Context, next: Next) {
  let userData: z.infer<typeof User.insertSchema> | undefined;

  let passwords:
    | {
        password: string;
        password_confirm: string;
      }
    | undefined;

  const errors: z.core.$ZodIssue[] = [];

  try {
    userData = await User.insertSchema.parseAsync(ctx.request.body);
  } catch (error) {
    if (!(error instanceof z.ZodError)) throw error;
    errors.push(...error.issues);
  }

  try {
    passwords = await z
      .object({
        password: User.passwordSchema,
        password_confirm: User.passwordSchema,
      })
      .refine((data) => data.password.trim() === data.password_confirm.trim(), {
        message: 'Password and password confirmation do not match',
        path: ['password_confirm'],
      })
      .parseAsync(ctx.request.body);
  } catch (error) {
    if (!(error instanceof z.ZodError)) throw error;
    errors.push(...error.issues);
  }

  if (errors.length > 0) {
    ctx.status = 400;

    const formValues = z.object({
      email: string().optional(),
      password: string().optional(),
      password_confirm: string().optional(),
    });

    ctx.log.error({errors});

    await ctx.render(
      <SignupForm errors={errors} {...formValues.parse(ctx.request.body)} />,
    );
    return;
  }

  if (!passwords) {
    throw new Error('Fatal: Passwords are required');
  }

  if (!userData) {
    throw new Error('Fatal: User data is required');
  }

  const hash = await argon2.hash(passwords.password);

  try {
    const user = await db
      .insertInto('users')
      .values({
        ...userData,
        hash,
      })
      .returning(['email', 'id', 'first_name'])
      .executeTakeFirstOrThrow();

    await ctx.login(user);

    await Emails.queueWelcomeEmail(user.id, user.email);

    ctx.set('Hx-Redirect', '/account');
  } catch (error) {
    ctx.log.error(error, 'Error creating user');
    if (ctx.session) {
      ctx.session.messages = [
        "An error occurred while creating your account. We're sending you an email with further instructions.",
      ];
    }

    ctx.set('Hx-Redirect', '/signup');
    return;
  }

  ctx.status = 201;
  ctx.body = 'ok';
}
