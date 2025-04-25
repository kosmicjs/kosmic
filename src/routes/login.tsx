import {type Next, type Context} from 'koa';
import passport from 'koa-passport';
import {Layout} from '#components/layout.js';
import {LoginForm} from '#components/login-form.js';

export async function post(ctx: Context, next: Next) {
  return passport.authenticate('local', {
    successRedirect: '/admin',
    failureRedirect: '/',
    failureMessage: 'Invalid email or password',
    successMessage: 'Logged in',
  })(ctx, next);
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
