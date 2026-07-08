# Kosmic

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D22-brightgreen)](https://nodejs.org)

Kosmic is a TypeScript + ESM monorepo of reusable packages for building Koa-based applications.

This README focuses on installing and using the packages in [packages/](packages).

## Requirements

- Node.js 22+
- npm

## Packages

| Package                 | Purpose                                                                                  |
| ----------------------- | ---------------------------------------------------------------------------------------- |
| `@kosmic/server`        | Opinionated Koa server bootstrap with middleware, static assets, and file-system routing |
| `@kosmic/router`        | File-system based router for Koa                                                         |
| `@kosmic/jsx`           | JSX render middleware (Preact + server rendering)                                        |
| `@kosmic/error-handler` | Error middleware with Zod-aware formatting                                               |
| `@kosmic/logger`        | Pino logger factory and HTTP logging middleware                                          |
| `@kosmic/helmet`        | Helmet middleware wrapper for Koa                                                        |
| `@kosmic/config`        | Central typed runtime configuration                                                      |
| `@kosmic/db`            | Kysely + PostgreSQL integration utilities                                                |
| `@kosmic/auth`          | Session and Passport-based authentication helpers                                        |
| `@kosmic/cli`           | CLI for build/dev/test/migrate/create workflows                                          |

## Install

### Use this repository as a workspace

```bash
npm install
npm run build
```

### Install published packages in another project

Install only what you need:

```bash
npm install @kosmic/server @kosmic/router @kosmic/logger
```

Or install a single package:

```bash
npm install @kosmic/db
```

## Quick Start

### 1) Boot a server with `@kosmic/server`

```ts
import {KosmicServer} from '@kosmic/server';

const server = new KosmicServer({});
await server.listen(3000, '0.0.0.0');
```

By default, `KosmicServer` looks for:

- routes in `src/routes`
- static assets in `src/public`

You can override both with constructor options.

### 2) Add file-system routes with `@kosmic/router`

```ts
import Koa from 'koa';
import {createFsRouter} from '@kosmic/router';

const app = new Koa();
const {middleware} = await createFsRouter(
  new URL('./routes', import.meta.url).pathname,
  app,
);

app.use(middleware);
```

Route files map to URL paths. Example conventions:

- `routes/index.ts` -> `/`
- `routes/users/index.ts` -> `/users`
- `routes/users/[id].ts` -> `/users/:id`

### 3) Render JSX with `@kosmic/jsx`

```ts
import Koa from 'koa';
import {renderMiddleware} from '@kosmic/jsx';

const app = new Koa();
app.use(renderMiddleware);

app.use(async (ctx) => {
  await ctx.render(<html><body>Hello</body></html>);
});
```

## Package Usage

### `@kosmic/config`

```ts
import {config} from '@kosmic/config';

console.log(config.port, config.host);
```

Configuration is loaded from environment variables and validated with Zod.

### `@kosmic/logger`

```ts
import {createLogger, createPinoMiddleware} from '@kosmic/logger';

const logger = createLogger({level: 'debug'});
const httpLogger = createPinoMiddleware({logger}, {environment: 'development'});
```

### `@kosmic/helmet`

```ts
import {createHelmetMiddleware} from '@kosmic/helmet';

app.use(createHelmetMiddleware());
```

### `@kosmic/error-handler`

```ts
import {errorHandler} from '@kosmic/error-handler';

app.use(errorHandler({logger}));
```

Install a render middleware first (such as `@kosmic/jsx`) so errors can be rendered in responses.

### `@kosmic/db`

```ts
import {KosmicDB} from '@kosmic/db';

type Database = Record<string, unknown>;

const kosmicDb = new KosmicDB<Database>({
  poolConfig: {
    connectionString: process.env.DATABASE_URL,
  },
});

const db = kosmicDb.db;
```

### `@kosmic/auth`

```ts
import {
  KosmicAuth,
  PostgresSessionStore,
  PostgresStorageAdapter,
} from '@kosmic/auth';

const auth = new KosmicAuth(
  new PostgresStorageAdapter(db),
  new PostgresSessionStore(db),
);

await auth.initialize(app);
```

Then use `auth.authenticateLocal` or `auth.authenticateBearer` as route middleware.

### `@kosmic/cli`

```bash
npx @kosmic/cli --help
npx @kosmic/cli create
npx @kosmic/cli dev
npx @kosmic/cli migrate
```

The binary name is also available as `kosmic` after installation.

## Development Commands

From the repository root:

```bash
npm run build
npm run check
npm run lint
npm test
```

Run scripts for one package:

```bash
npm run build -w @kosmic/router
npm test -w @kosmic/router
```

## Publishing

This repo uses Changesets:

```bash
npm run changeset
npm run version
npm run release
```

## License

MIT © [Spencer Snyder](https://spencersnyder.io)
