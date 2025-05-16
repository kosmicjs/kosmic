import {type Middleware} from 'koa';
import Layout from '#components/layout.js';
import {type Use} from '#middleware/router/types.js';

export const use: Use = async (ctx, next) => {
  if (!ctx.isAuthenticated()) {
    ctx.status = 401;
    throw new Error('Unauthorized');
  }

  await next();
};

export const get: Middleware = async (ctx, next) => {
  if (!ctx.state.user) {
    throw new Error('Unauthorized');
  }

  await ctx.render(
    <Layout>
      <div class="row">
        <div class="col-12 p-5">
          <div className="d-flex justify-content-center">
            <h2>Admin</h2>
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
