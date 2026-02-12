import clsx from 'clsx';
import {ThemeSwitchIsland} from '#islands/theme-switch.js';
import {getCtx} from '#server';

type NavItem = {
  name: string;
  href: string;
  matchType: 'exact' | 'startsWith' | 'endsWith';
  protected?: boolean;
};

const NavItems: NavItem[] = [
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
    name: 'Account',
    href: '/account',
    matchType: 'exact',
    protected: true,
  },
  {
    name: 'Entities',
    href: '/account/entities',
    matchType: 'exact',
    protected: true,
  },
] as const;

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
                            : ctx?.path?.[item.matchType](item.href),
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
                          : ctx?.path?.[item.matchType](item.href),
                    })}
                    aria-current="page"
                    href={item.href}
                  >
                    {item.name}
                  </a>
                </li>
              ),
            )}
            <li class="nav-item dropdown">
              <a
                class="nav-link dropdown-toggle"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Tools
              </a>
              <ul class="dropdown-menu">
                <li>
                  <a class="dropdown-item" href="/tools/email-preview">
                    Email Previewer
                  </a>
                </li>
                <li>
                  <a class="dropdown-item" href="#">
                    Jobs Manager
                  </a>
                </li>
              </ul>
            </li>
          </ul>
          <div class="me-5">
            <ThemeSwitchIsland
              isChecked={ctx.cookies?.get('kosmic-color-mode') === 'light'}
            />
          </div>
          <div>
            {ctx.state.user?.email ? (
              <a class="btn btn-outline-primary" type="button" href="/logout">
                Logout
              </a>
            ) : (
              <>
                <a
                  class="btn btn-outline-primary mx-2"
                  type="button"
                  href="/login"
                >
                  Login
                </a>
                <a
                  class="btn btn-outline-primary mx-2"
                  type="button"
                  href="/signup"
                >
                  Signup
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
