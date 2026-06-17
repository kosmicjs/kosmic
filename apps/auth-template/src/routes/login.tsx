import type {Context, Next} from '@kosmic/server';
import {object, string} from 'zod';
import Layout from '#components/layout.js';
import {LoginForm} from '#components/login-form.js';
import {auth} from '#server';

/**
 * Render the login page.
 */
export async function get(ctx: Context, next: Next) {
  const redirect =
    typeof ctx.query.redirect === 'string' ? ctx.query.redirect : undefined;

  return ctx.render(
    <Layout title="Log in">
      <main className="page-shell">
        <section className="card auth-card">
          <h1>Log in</h1>
          <p className="lead">Use your email and password to continue.</p>
          <LoginForm redirect={redirect} />
          <p className="muted-row">
            Need an account? <a href="/signup">Create one</a>
          </p>
        </section>
      </main>
    </Layout>,
  );
}

/**
 * Handle login form submission.
 */
export async function post(ctx: Context, next: Next) {
  const redirect =
    typeof ctx.query.redirect === 'string' ? ctx.query.redirect : '/account';

  const form = object({
    email: string().optional(),
  }).safeParse(ctx.request.body);

  const email = form.success ? form.data.email : undefined;

  await auth.authenticateLocal(ctx, next);

  if (ctx.status === 401 || !ctx.isAuthenticated()) {
    ctx.status = 401;

    await ctx.render(
      <Layout title="Log in">
        <main className="page-shell">
          <section className="card auth-card">
            <h1>Log in</h1>
            <p className="lead">Use your email and password to continue.</p>
            <LoginForm
              redirect={redirect}
              email={email}
              error="Invalid email or password."
            />
            <p className="muted-row">
              Need an account? <a href="/signup">Create one</a>
            </p>
          </section>
        </main>
      </Layout>,
    );
    return;
  }

  ctx.redirect(redirect);
}
