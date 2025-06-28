import type {Context, Next} from 'koa';
import argon2 from 'argon2';
import z from 'zod';
import * as User from '#models/users.js';
import {SignupForm} from '#components/signup-form.js';
import Layout from '#components/layout.js';
import {config} from '#config/index.js';
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

const passwordSchema = z.string().min(8).max(255);

if (config.kosmicEnv === 'production') {
  passwordSchema
    .refine((password) => /[A-Z]/.test(password), {
      message: 'Password must contain an uppercase letter',
    })
    .refine((password) => /[a-z]/.test(password), {
      message: 'Password must contain a lowercase letter',
    })
    .refine((password) => /\d/.test(password), {
      message: 'Password must contain a digit',
    })
    .refine((password) => /[!@#$%^&*]/.test(password), {
      message: 'Password must contain a special character',
    });
}

export async function post(ctx: Context, next: Next) {
  let userData;

  try {
    userData = await User.insertSchema.parseAsync(ctx.request.body);
  } catch (error) {
    if (!(error instanceof z.ZodError)) throw error;
    ctx.req.log.error(error);
    if (ctx.session) {
      ctx.session.messages = error.errors.map((e) => e.message);
    }

    ctx.set('Location', '/signup');
    ctx.status = 400; // Bad Request
    ctx.body = 'Password and password confirmation do not match';
    return;
  }

  const passwords = await z
    .object({
      password: passwordSchema,
      password_confirm: passwordSchema,
    })
    .parseAsync(ctx.request.body);

  const {password, password_confirm: passwordConfirm} = passwords;

  if (!passwordConfirm || passwordConfirm !== password) {
    ctx.req.log.error(
      new Error('Password and password confirmation do not match'),
    );
    if (ctx.session) {
      ctx.session.messages = [
        'Password and password confirmation do not match',
      ];
    }

    ctx.set('Location', '/signup');
    ctx.status = 400; // Bad Request
    ctx.body = 'Password and password confirmation do not match';

    return;
  }

  const hash = await argon2.hash(passwords.password);

  const user = await db
    .insertInto('users')
    .values({
      ...userData,
      hash,
    })
    .returning(['email', 'id', 'first_name'])
    .executeTakeFirstOrThrow();

  await Emails.queueWelcomeEmail(user.id, user.email, user.first_name ?? '');

  await ctx.login(user);

  ctx.redirect('/account');
}
