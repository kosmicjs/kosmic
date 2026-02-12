# Copilot instructions for kosmic

Purpose: give AI coding agents the minimum, precise context to ship features safely in this repo.

## Architecture (big picture)

- Server: Koa app (`src/server.ts`) with middleware chain (pino logger, conditional/etag, bodyparser, session store, passport, JSX render, helmet).
- Routing: file‑system router (`src/middleware/router/index.ts`) maps files under `src/routes/**` to HTTP paths. Dynamic segments use `[id].tsx`. Route modules can export `get/post/put/patch/delete` and an optional `use` (per‑verb middleware). Schema enforced by zod (`schema.ts`).
- Views: Preact JSX rendered on server (`renderMiddleware`). Layout at `src/components/layout.tsx` wires Bootstrap 5, HTMX (hx-boost on <body>), and Vite assets. In prod, reads `.vite/manifest.json`; in dev loads Vite at :5173.
- Client: `src/client/` (scripts, islands, styles). HTMX powers interactivity; “islands” enable optional client hydration.
- DB: PostgreSQL via Kysely (`src/db/index.ts`), dialect abstraction, typed `Database` (`src/models/index.ts`). Migrations live in `src/db/migrations.ts` (timestamped “sequence” blocks) and helpers under `src/db/utils/*`.
- Auth/Sessions: `koa-session` with Kysely store (`src/utils/kysely-session-store.ts`), Passport strategies (`src/middleware/passport.ts`).

## Conventions that matter

- Always return HTML via `await ctx.render(<Component />)` for pages/partials. For HTMX flows, return small partials; for redirects set `ctx.set('HX-Redirect', '/path')`.
- Prefer route modules over ad‑hoc routers. Export handlers with the HTTP verb name. Use `use` to attach per‑route middleware. Example:

  export const use = { get: authOnly, post: [authOnly, csrf] };
  export const get: Middleware = async (ctx) => ctx.render(<Page />);
  export const post: Middleware = async (ctx) => { /_ handle form _/ };

- Dynamic params come from `ctx.params`; form/json body from `ctx.request.body` (koa-bodyparser).
- Use Preact functional components; Bootstrap 5 classes; HTMX attributes (`hx-post`, `hx-swap`, `hx-target`).
- Use Kysely for all SQL. Types are declared in `src/models/*` and composed in `src/models/index.ts`.
- Use import aliases from package.json "imports" (components/_, models/_, middleware/_, db/_, utils/\*, server) instead of long relative paths.

## Typical feature workflow (example)

1. Create a route file under `src/routes/...`, e.g. `src/routes/account/api-keys.tsx`.
2. Add `use` for auth, then implement `post`/`get`. Use `ctx.render` to return a Bootstrap partial for HTMX requests.
3. Persist via Kysely (`src/db/index.ts`) using typed tables from `src/models/**`.
4. Update/compose components in `src/components/**` or `src/client/**` (scripts/islands) if UI needs interactivity.
5. For redirects from HTMX forms, set `HX-Redirect`; otherwise return a small HTML fragment.

## DB + migrations

- Add/modify tables in `src/db/migrations.ts` using the sequence blocks. Use helpers `addIdColumn`, `addTimestampsColumns`, and `createTimestampTrigger`.
- Seed patterns: see initial admin user and API key creation inside migrations (calls the API keys model generateApiKey).

## Build, run, test (npm scripts)

- Dev: `npm run dev` (Koa + Vite dev server loaded by layout).
- Build: `npm run build` → tsc + vite + copy public into `dist/src/public`.
- Migrate: `npm run migrate` (builds then runs migrator CLI with KOSMIC_ENV=migration).
- Test: `npm test` (builds, then Node test runner; see `test/server.test.ts`).

## Examples in repo

- Routing + use: `src/middleware/router/index.ts` and `schema.ts` for the `use` shapes.
- Server render: `src/middleware/jsx.middleware.ts`, `src/components/layout.tsx`.
- HTMX flow: forms/components in `src/routes/**` often set `hx-*` and return partials via `ctx.render`.

When unsure, search existing routes under `src/routes/**` and mirror patterns. Keep returns HTML (not JSON) unless you are in `src/routes/api/**`.
