import {type Middleware} from 'koa';
import Layout from '#components/layout.js';
import {type Use} from '#middleware/router/types.js';

export const use: Use = async (ctx, next) => {
  if (!ctx.isAuthenticated()) {
    if (ctx.session)
      ctx.session.messages = [
        'Not authorized. Please log in to access this page.',
      ];
    ctx.redirect(`/login?redirect=${ctx.request.url}`);
    return;
  }

  await next();
};

export const get: Middleware = async (ctx, next) => {
  if (!ctx.state.user) {
    throw new Error('Unauthorized');
  }

  await ctx.render(
    <Layout>
      <div class="row justify-content-center align-items-center">
        <div class="col-12 col-sm-8 col-md-6 col-lg-4">
          <div className="d-flex justify-content-center">
            <h2>My Account</h2>
          </div>
          <p>Welcome to your future admin panel, {ctx.state.user.email}</p>
          <form action={`/users/${ctx.state.user.id}`} method="put">
            <div class="mb-3">
              <label for="email" class="form-label">
                Email:
              </label>
              <input
                disabled
                type="text"
                value={ctx.state.user.email ?? ''}
                class="form-control form-control-disabled"
                name="email"
                id="email"
                autoComplete="email"
              />
            </div>
            <div class="mb-3">
              <label for="first_name" class="form-label">
                First Name:
              </label>
              <input
                type="text"
                value={ctx.state.user.first_name ?? ''}
                class="form-control"
                name="first_name"
                id="first_name"
                autoComplete="given_name"
              />
            </div>
            <div class="mb-3">
              <label for="last_name" class="form-label">
                Last Name:
              </label>
              <input
                type="text"
                value={ctx.state.user.last_name ?? ''}
                class="form-control"
                name="last_name"
                id="last_name"
                autoComplete="family-name"
              />
            </div>
            <button type="submit" class="btn btn-primary">
              Update
            </button>
          </form>
        </div>
      </div>
    </Layout>,
  );
};
