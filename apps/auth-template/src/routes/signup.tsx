import argon2 from 'argon2';
import z, {string} from 'zod';
import * as User from '@kosmic/auth/models';
import type {Context, Next} from '@kosmic/server';
import Layout from '#components/layout.js';
import {SignupForm} from '#components/signup-form.js';
import {db} from '#db/index.js';

/**
 * Render the signup page.
 */
export async function get(ctx: Context, next: Next) {
  return ctx.render(
    <Layout title="Sign up">
      <main className="page-shell">
        <section className="card auth-card">
          <h1>Create account</h1>
          <p className="lead">Start with an email and password.</p>
          <SignupForm />
          <p className="muted-row">
            Already have an account? <a href="/login">Log in</a>
          </p>
        </section>
      </main>
    </Layout>,
  );
}

/**
 * Handle signup form submission.
 */
export async function post(ctx: Context, next: Next) {
  let userData: z.infer<typeof User.insertSchema> | undefined;

  let passwords:
    | {
        password: string;
        password_confirm: string;
      }
    | undefined;

  const errors: z.core.$ZodIssue[] = [];

  const form = z
    .object({
      email: string().optional(),
    })
    .safeParse(ctx.request.body);

  const email = form.success ? form.data.email : undefined;

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

    await ctx.render(
      <Layout title="Sign up">
        <main className="page-shell">
          <section className="card auth-card">
            <h1>Create account</h1>
            <p className="lead">Start with an email and password.</p>
            <SignupForm
              errors={errors}
              {...formValues.parse(ctx.request.body)}
            />
            <p className="muted-row">
              Already have an account? <a href="/login">Log in</a>
            </p>
          </section>
        </main>
      </Layout>,
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
  } catch (error) {
    ctx.log.error(error, 'Error creating user');
    ctx.status = 400;

    await ctx.render(
      <Layout title="Sign up">
        <main className="page-shell">
          <section className="card auth-card">
            <h1>Create account</h1>
            <p className="lead">Start with an email and password.</p>
            <SignupForm
              email={email}
              errors={[
                {
                  path: ['email'],
                  message: 'Unable to create account with that email.',
                },
              ]}
            />
            <p className="muted-row">
              Already have an account? <a href="/login">Log in</a>
            </p>
          </section>
        </main>
      </Layout>,
    );
    return;
  }

  ctx.redirect('/account');
}
