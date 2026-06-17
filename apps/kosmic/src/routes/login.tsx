import type {Context, Next} from '@kosmic/server';
import {Layout} from '#components/layout.js';
import {LoginForm} from '#components/login-form.js';
import {auth} from '#auth';

export async function post(ctx: Context, next: Next) {
  ctx.set('HX-Redirect', '/login');

  await auth.authenticateLocal(ctx, next);

  if (ctx.status === 401 || !ctx.isAuthenticated()) {
    ctx.status = 401;
    return;
  }

  // successful login
  ctx.set('HX-Redirect', '/account');
  ctx.status = 200;
}

export async function get(ctx: Context, next: Next) {
  return ctx.render(
    <Layout>
      <div class="row justify-content-center align-items-center">
        <div class="col-12 col-sm-8 col-md-6 col-lg-4">
          <LoginForm />
        </div>
      </div>
    </Layout>,
  );
}
