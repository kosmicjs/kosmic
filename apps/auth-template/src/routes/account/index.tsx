import type {Middleware} from '@kosmic/server';
import type {Use} from '@kosmic/router';
import Layout from '#components/layout.js';

/**
 * Guard account routes behind authentication.
 */
export const use: Use = async (ctx, next) => {
  if (!ctx.isAuthenticated()) {
    const redirect = encodeURIComponent(ctx.request.url);
    ctx.redirect(`/login?redirect=${redirect}`);
    return;
  }

  await next();
};

/**
 * Render the minimal account page.
 */
export const get: Middleware = async (ctx, next) => {
  const {user} = ctx.state;

  return ctx.render(
    <Layout title="My account">
      <main className="page-shell">
        <section className="card auth-card">
          <h1>My account</h1>

          <div className="account-grid">
            <div className="detail-row">
              <span>Email</span>
              <strong>{user?.email ?? 'n/a'}</strong>
            </div>
            <div className="detail-row">
              <span>Name</span>
              <strong>
                {`${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim() ||
                  'Not set'}
              </strong>
            </div>
            <div className="detail-row">
              <span>Role</span>
              <strong>{user?.role ?? 'user'}</strong>
            </div>
          </div>

          <div className="button-row">
            <a className="ghost-button" href="/">
              Home
            </a>
            <a className="primary-button" href="/logout">
              Log out
            </a>
          </div>
        </section>
      </main>
    </Layout>,
  );
};
