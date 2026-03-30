import type {Next, Context} from '@kosmic/server';
import {authenticateLocal} from '../auth.js';
import {Layout} from '#components/layout.js';
import {LoginForm} from '#components/login-form.js';

export async function post(ctx: Context, next: Next) {
  ctx.set('HX-Redirect', '/login');

  await authenticateLocal(ctx, next);

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
