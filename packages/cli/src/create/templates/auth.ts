export const authTemplateFiles: Record<string, string> = {
  '.env.example': `# Server settings
PORT=3000
SERVER_HOST=127.0.0.1
LOG_LEVEL=info

# Basic auth credentials for scaffolded login
APP_AUTH_USERNAME=admin
APP_AUTH_PASSWORD=kosmic
`,
  'README.md': `# {{projectName}}

A minimal Kosmic application scaffolded with optional auth support.

## Scripts

- npm run dev
- npm run build
- npm run start
- npm run lint

## Development

1. Copy .env.example to .env.
2. Run npm install.
3. Run npm run dev.
4. Visit /login and sign in with APP_AUTH_USERNAME and APP_AUTH_PASSWORD.
`,
  'src/server.ts': `import path from 'node:path';
import {KosmicServer, type SessionStore} from '@kosmic/server';

class MemorySessionStore implements SessionStore {
  readonly #sessions = new Map<string, unknown>();

  /**
   * Retrieve a serialized session value.
   */
  async get(key: string): Promise<unknown> {
    return this.#sessions.get(key);
  }

  /**
   * Persist a serialized session value.
   */
  async set(key: string, value: unknown): Promise<void> {
    this.#sessions.set(key, value);
  }

  /**
   * Remove an existing session value.
   */
  async destroy(key: string): Promise<void> {
    this.#sessions.delete(key);
  }
}

export const kosmicServer = new KosmicServer({
  routesDir: path.join(import.meta.dirname, 'routes'),
  sessionStore: new MemorySessionStore(),
});

/**
 * Return the app singleton.
 */
export function getServer(): KosmicServer {
  return kosmicServer;
}
`,
  'src/routes/index.ts': `import type {Context} from '@kosmic/server';

/**
 * Render the default landing page.
 */
export async function get(ctx: Context) {
  const user = ctx.session?.user;

  ctx.type = 'html';
  ctx.body = \`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{{projectName}}</title>
    <style>
      :root {
        --bg: #f6f7fb;
        --card: #ffffff;
        --text: #14213d;
        --muted: #5f6c80;
        --accent: #fca311;
      }

      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif;
        color: var(--text);
        background: radial-gradient(circle at 20% 20%, #fff9eb 0%, var(--bg) 50%);
      }

      main {
        max-width: 42rem;
        padding: 2rem;
      }

      section {
        background: var(--card);
        border-radius: 14px;
        box-shadow: 0 12px 36px rgb(20 33 61 / 0.12);
        padding: 2rem;
      }

      h1 {
        margin-top: 0;
        font-size: 2rem;
      }

      nav {
        margin-top: 1.25rem;
        display: flex;
        gap: 0.75rem;
      }

      a {
        color: #7a4a00;
      }

      p {
        color: var(--muted);
        line-height: 1.6;
      }
    </style>
  </head>
  <body>
    <main>
      <section>
        <h1>{{projectName}}</h1>
        <p>
          This app includes optional auth routes. Edit <code>src/routes</code> to
          extend the template.
        </p>
        <nav>
          \${
            user
              ? '<a href="/account">Account</a><a href="/logout">Logout</a>'
              : '<a href="/login">Login</a>'
          }
        </nav>
      </section>
    </main>
  </body>
</html>\`;
}
`,
  'src/routes/login.ts': `import type {Context} from '@kosmic/server';

/**
 * Safely read a trimmed string value from an unknown request body object.
 */
function readBodyString(
  body: unknown,
  key: 'username' | 'password',
): string | undefined {
  if (!body || typeof body !== 'object') {
    return undefined;
  }

  const value = (body as Record<string, unknown>)[key];

  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : undefined;
}

/**
 * Render the login form.
 */
export async function get(ctx: Context) {
  ctx.type = 'html';
  ctx.body = \`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Login</title>
    <style>
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif;
        background: #f6f7fb;
      }

      form {
        width: min(24rem, calc(100vw - 2rem));
        background: #ffffff;
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 8px 24px rgb(20 33 61 / 0.12);
      }

      label {
        display: block;
        margin-bottom: 0.5rem;
      }

      input {
        width: 100%;
        padding: 0.6rem;
        margin-top: 0.25rem;
        margin-bottom: 0.75rem;
        border: 1px solid #d6dbe7;
        border-radius: 8px;
      }

      button {
        border: 0;
        border-radius: 8px;
        padding: 0.6rem 0.9rem;
        background: #fca311;
        color: #1f2937;
        font-weight: 600;
      }

      .message {
        color: #9a3412;
      }
    </style>
  </head>
  <body>
    <form method="post" action="/login">
      <h1>Sign in</h1>
      <p class="message">\${ctx.query.error ? 'Invalid credentials.' : ''}</p>
      <label>
        Username
        <input required name="username" autocomplete="username" />
      </label>
      <label>
        Password
        <input
          required
          type="password"
          name="password"
          autocomplete="current-password"
        />
      </label>
      <button type="submit">Login</button>
    </form>
  </body>
</html>\`;
}

/**
 * Validate credentials and establish a session.
 */
export async function post(ctx: Context) {
  const expectedUsername = process.env.APP_AUTH_USERNAME ?? 'admin';
  const expectedPassword = process.env.APP_AUTH_PASSWORD ?? 'kosmic';
  const username = readBodyString(ctx.request.body, 'username');
  const password = readBodyString(ctx.request.body, 'password');

  if (!ctx.session || username !== expectedUsername || password !== expectedPassword) {
    ctx.redirect('/login?error=1');
    return;
  }

  ctx.session.user = {
    username,
    loggedInAt: new Date().toISOString(),
  };

  ctx.redirect('/account');
}
`,
  'src/routes/logout.ts': `import type {Context} from '@kosmic/server';

/**
 * Destroy the local session user and redirect home.
 */
export async function get(ctx: Context) {
  if (ctx.session) {
    delete ctx.session.user;
  }

  ctx.redirect('/');
}
`,
  'src/routes/account.ts': `import type {Context} from '@kosmic/server';

/**
 * Render the protected account page.
 */
export async function get(ctx: Context) {
  const user = ctx.session?.user;

  if (!user) {
    ctx.redirect('/login');
    return;
  }

  ctx.type = 'html';
  ctx.body = \`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Account</title>
    <style>
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif;
        background: #f6f7fb;
      }

      article {
        width: min(40rem, calc(100vw - 2rem));
        background: #ffffff;
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 8px 24px rgb(20 33 61 / 0.12);
      }
    </style>
  </head>
  <body>
    <article>
      <h1>Account</h1>
      <p>Welcome, \${user.username}.</p>
      <p>Logged in at \${new Date(user.loggedInAt).toLocaleString()}.</p>
      <p><a href="/logout">Logout</a></p>
    </article>
  </body>
</html>\`;
}
`,
  'src/types/session.d.ts': `declare module 'koa-session' {
  interface Session {
    user?: {
      username: string;
      loggedInAt: string;
    };
  }
}
`,
};
