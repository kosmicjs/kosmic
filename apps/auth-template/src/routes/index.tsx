import type {Context, Next} from '@kosmic/server';
import Layout from '#components/layout.js';

/**
 * Render a tiny landing page with auth links.
 */
export const get = async (ctx: Context, next: Next) => {
  const loggedIn = ctx.isAuthenticated();

  return ctx.render(
    <Layout title="Auth Template">
      <main className="page-shell">
        <section className="card">
          <p className="eyebrow">auth-template</p>
          <h1>Simple auth starter</h1>
          <p className="lead">
            Sign up, log in, and view your account details. Bare minimum setup,
            ready for customization.
          </p>

          <div className="button-row">
            {loggedIn ? (
              <>
                <a className="primary-button" href="/account">
                  Go to account
                </a>
                <a className="ghost-button" href="/logout">
                  Log out
                </a>
              </>
            ) : (
              <>
                <a className="primary-button" href="/signup">
                  Sign up
                </a>
                <a className="ghost-button" href="/login">
                  Log in
                </a>
              </>
            )}
          </div>
        </section>
      </main>
    </Layout>,
  );
};
