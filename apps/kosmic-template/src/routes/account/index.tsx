import type {Middleware} from 'koa';
import type {Use} from '@kosmic/router';
import Layout from '#components/layout.js';
import {db} from '#db/index.js';

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

  const apiKeys = await db
    .selectFrom('api_keys')
    .where('user_id', '=', ctx.state.user.id)
    .select(['id', 'name', 'last_used_at', 'is_active', 'created_at'])
    .execute();

  await ctx.render(
    <Layout>
      <div class="row">
        <div class="col-12">
          <div className="d-flex justify-content-start">
            <h2>My Account</h2>
          </div>

          <hr />
        </div>
      </div>

      {/* Account Details Card */}
      <div class="row g-4">
        <div class="col-12 col-md-6">
          <div class="card h-100">
            <div class="card-header">
              <h5 class="card-title mb-0">Account Details</h5>
            </div>
            <div class="card-body">
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
        </div>
        {/* Sessions & API Keys Card */}
        <div class="col-12 col-md-6">
          <div class="card h-100">
            <div class="card-header">
              <h5 class="card-title mb-0">Sessions & API Keys</h5>
            </div>
            <div class="card-body">
              {/* Active Sessions */}
              <h6 class="card-subtitle mb-2 text-muted">Active Sessions</h6>
              <div class="mb-3">
                <div class="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
                  <div>
                    <small class="text-muted">Current Session</small>
                    <br />
                    <span class="badge bg-success">Active</span>
                  </div>
                  <small class="text-muted">
                    Last active: {new Date().toLocaleDateString()}
                  </small>
                </div>
              </div>

              {/* API Keys */}
              <h6 class="card-subtitle mb-2 text-muted">API Keys</h6>
              <div class="mb-3">
                {apiKeys.length > 0 ? (
                  apiKeys.map((key) => (
                    <div
                      key={key.id}
                      class="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2 api-key-row"
                    >
                      <div>
                        <div class="fw-medium">{key.name || 'Unnamed Key'}</div>
                        <small class="text-muted">
                          Created:{' '}
                          {new Date(key.created_at!).toLocaleDateString()}
                        </small>
                        <br />
                        <small class="text-muted">
                          Last used:{' '}
                          {key.last_used_at
                            ? new Date(key.last_used_at).toLocaleDateString()
                            : 'Never'}
                        </small>
                      </div>
                      <div class="d-flex">
                        <span
                          class={`btn btn-sm ${key.is_active ? 'btn-outline-success' : 'btn-outline-secondary'}`}
                        >
                          {key.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <button
                          type="button"
                          class="btn btn-outline-danger btn-sm ms-2"
                          hx-delete={`/account/api-keys/${key.id}`}
                          hx-target="closest .api-key-row"
                          hx-swap="outerHTML"
                          hx-confirm="Are you sure you want to revoke this API key?"
                        >
                          Revoke
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div class="d-flex justify-content-between align-items-center">
                    <span class="text-muted">No API keys created</span>
                  </div>
                )}

                {/* API Key Creation Form */}
                <form
                  class="mt-3"
                  hx-post="/account/api-keys"
                  hx-target="#api-key-result"
                  hx-swap="innerHTML"
                >
                  <div class="input-group">
                    <input
                      type="text"
                      name="name"
                      class="form-control form-control-sm"
                      placeholder="API Key name (optional)"
                    />
                    <button
                      type="submit"
                      class="btn btn-outline-primary btn-sm"
                    >
                      Create API Key
                    </button>
                  </div>
                </form>

                {/* Result container for the API key response */}
                <div id="api-key-result" class="mt-3"></div>
              </div>

              {/* Actions */}
              <div class="d-flex gap-2 mt-3">
                <button type="button" class="btn btn-outline-danger btn-sm">
                  Revoke All Sessions
                </button>
                <button type="button" class="btn btn-outline-secondary btn-sm">
                  Manage API Keys
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>,
  );
};
