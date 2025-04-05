import clsx from 'clsx';
import {getCtx} from '#server';

const NavItems = [
  {
    name: 'Home',
    href: '/',
    matchType: 'exact',
  },
  // {
  //   name: 'Pricing',
  //   href: '/pricing',
  //   matchType: 'startsWith',
  // },
  {
    name: 'Docs',
    href: '/docs',
    matchType: 'startsWith',
  },
  {
    name: 'Admin',
    href: '/admin',
    matchType: 'startsWith',
    protected: true,
  },
  {
    name: 'Entities',
    href: '/admin/entities',
    matchType: 'startsWith',
    protected: true,
  },
];

export default function Nav() {
  const ctx = getCtx();
  return (
    <nav class="navbar navbar-expand-lg bg-body-tertiary">
      <div class="container-fluid">
        <a class="navbar-brand" href="/">
          <img
            src="/favicon-32x32.png"
            alt="logo"
            width="30"
            height="24"
            class="d-inline-block align-text-top"
          />
        </a>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon" />
        </button>
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            {NavItems.map((item) =>
              item.protected ? (
                ctx.isAuthenticated() ? (
                  <li class="nav-item">
                    <a
                      class={clsx('nav-link', {
                        active:
                          item.matchType === 'exact'
                            ? ctx?.path === item.href
                            : ctx?.path?.startsWith(item.href),
                      })}
                      aria-current="page"
                      href={item.href}
                    >
                      {item.name}
                    </a>
                  </li>
                ) : null
              ) : (
                <li class="nav-item">
                  <a
                    class={clsx('nav-link', {
                      active:
                        item.matchType === 'exact'
                          ? ctx?.path === item.href
                          : ctx?.path?.startsWith(item.href),
                    })}
                    aria-current="page"
                    href={item.href}
                  >
                    {item.name}
                  </a>
                </li>
              ),
            )}
          </ul>
          <div>
            <div class="form-check form-switch">
              <input // eslint-disable-line react/checked-requires-onchange-or-readonly
                class="form-check-input"
                type="checkbox"
                role="switch"
                id="color-mode-switch"
                checked={
                  ctx.cookies?.get('kosmic-color-mode') === 'light'
                    ? true
                    : undefined
                }
              />
              <label class="form-check-label" for="color-mode-switch">
                Theme
              </label>
            </div>
          </div>
          <div>
            {ctx.state.user?.email ? (
              <a class="btn btn-outline-warning" type="button" href="/logout">
                Logout
              </a>
            ) : (
              <>
                <button
                  class="btn btn-outline-warning mx-2"
                  type="button"
                  hx-get="/modals/login"
                  hx-target="#modal-content"
                  hx-indicator="#modal-content"
                  data-bs-toggle="modal"
                  data-bs-target="#modal"
                >
                  Login
                </button>
                <button
                  class="btn btn-outline-warning"
                  type="button"
                  hx-get="/modals/signup"
                  hx-target="#modal-content"
                  hx-indicator="#modal-content"
                  data-bs-toggle="modal"
                  data-bs-target="#modal"
                >
                  Signup
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
