# Kosmic Agent Instructions

Instructions for agentic AI coding assistants (OpenCode, Cursor, Copilot, etc.) working in the Kosmic template repository.

See also: `.github/copilot-instructions.md` for architecture overview and workflow examples.

---

## Quick Command Reference

### Development

- `npm run dev` - Start dev server (Koa + Vite hot reload)
- `npm run build` - Full production build (tsc + vite + copy public)
- `npm run check` - TypeScript type checking only (no emit)
- `npm run clean` - Remove dist directory

### Testing

- `npm test` - Run all tests (builds first, then Node test runner)
- `npm run test:watch` - Watch mode for tests
- Single test file: `NODE_ENV=test KOSMIC_ENV=test node --test dist/test/specific.test.js`
- Filter by name: Add `--test-name-pattern="pattern"` flag

### Linting & Formatting

- `npm run lint` - Run XO linter (reports errors only)
- `xo --fix` - Auto-fix linting issues
- Prettier runs via XO (configured in xo.config.ts)

### Database

- `npm run migrate` - Run database migrations (builds first)
- Migrations CLI: `KOSMIC_ENV=migration node dist/src/db/utils/cli.js`

---

## Tech Stack

- **Server**: Koa v3 with middleware chain (pino, bodyparser, session, passport, JSX renderer, helmet)
- **Views**: Preact JSX (server-side rendering)
- **Client**: HTMX for interactivity, optional Preact islands for hydration
- **Styling**: Bootstrap 5.3.8
- **Database**: PostgreSQL via Kysely (typed query builder)
- **Validation**: Zod v4
- **Auth**: Passport.js with Kysely session store
- **Routing**: File-system router (`src/routes/**`)

---

## Code Style Guidelines

### TypeScript Strictness

**Critical compiler options enabled:**

- `strict: true`
- `strictNullChecks: true`
- `noUncheckedIndexedAccess: true` - Array access returns `T | undefined`
- `exactOptionalPropertyTypes: true` - Optional props cannot be explicitly undefined
- `verbatimModuleSyntax: true` - Explicit type imports required

**Always handle undefined/null:**

```typescript
// ❌ Bad
const user = users[0];
user.name; // Error: user might be undefined

// ✅ Good
const user = users[0];
if (!user) throw new Error("User not found");
user.name; // OK
```

### Import Conventions

**CRITICAL - Type imports (enforced by XO):**

```typescript
// ❌ Bad
import { Middleware } from "koa";
import { Selectable } from "kysely";

// ✅ Good
import type { Middleware } from "koa";
import type { Selectable } from "kysely";
```

**CRITICAL - Use import aliases (NEVER relative paths):**

```typescript
// ❌ Bad
import Layout from "../../components/layout.js";
import { db } from "../../../db/index.js";

// ✅ Good
import Layout from "#components/layout.js";
import { db } from "#db/index.js";
```

**Available aliases (from package.json):**

- `#components/*` → `./dist/src/components/*`
- `#models/*` → `./dist/src/models/*`
- `#db/*` → `./dist/src/db/*`
- `#middleware/*` → `./dist/src/middleware/*`
- `#utils/*` → `./dist/src/utils/*`
- `#emails/*` → `./dist/src/emails/*`
- `#islands/*` → `./dist/src/client/islands/*`
- `#config/*` → `./dist/src/config/*`
- `#server` → `./dist/src/server.js`

### Naming Conventions

- **Files**: `kebab-case.tsx` (e.g., `api-keys.tsx`, `entity-card.tsx`)
- **Components**: `PascalCase` (e.g., `EntityCard`, `ModalButton`)
- **Variables/functions**: `camelCase` (e.g., `getUserById`, `entityList`)
- **Constants**: `UPPER_SNAKE_CASE` for true constants (e.g., `MAX_RETRIES`)
- **Database tables**: `snake_case` plural (e.g., `users`, `api_keys`, `entities`)
- **Database columns**: `snake_case` (e.g., `user_id`, `created_at`, `first_name`)

### Route Handler Patterns

**File location**: `src/routes/**/*.tsx` or `*.ts`

**Dynamic segments**: Use `[id].tsx`, `[slug].tsx`, etc. Access via `ctx.params.id`

**Export pattern**:

```typescript
import type {Middleware} from 'koa';
import {db} from '#db/index.js';
import Layout from '#components/layout.js';
import * as EntityModel from '#models/entities.js';

// Optional per-route middleware
export const use = {
  get: authOnly,
  post: [authOnly, csrfMiddleware],
};

export const get: Middleware = async (ctx) => {
  const entities = await db
    .selectFrom('entities')
    .selectAll()
    .where('user_id', '=', ctx.state.user.id)
    .execute();

  await ctx.render(<Layout>{/* JSX */}</Layout>);
};

export const post: Middleware = async (ctx) => {
  const validated = await EntityModel.insertSchema.parseAsync(
    ctx.request.body
  );

  const entity = await db
    .insertInto('entities')
    .values(validated)
    .returningAll()
    .executeTakeFirst();

  // For HTMX redirects
  ctx.set('HX-Redirect', '/account/entities');
  ctx.status = 200;

  // Or return partial HTML
  await ctx.render(<EntityCard entity={entity} />);
};
```

**Return HTML, not JSON** (except in `src/routes/api/**`):

- Full pages: `await ctx.render(<Layout>...</Layout>)`
- HTMX partials: `await ctx.render(<SmallComponent />)`
- HTMX redirects: `ctx.set('HX-Redirect', '/path')` + `ctx.status = 200`

### Component Patterns

**Functional components only**:

```typescript
import type {ComponentChildren} from 'preact';

type Props = {
  readonly title: string;
  readonly children?: ComponentChildren;
  readonly isActive?: boolean;
};

export function MyComponent({title, children, isActive}: Props) {
  return (
    <div class="container">
      <h1 class="text-primary">{title}</h1>
      {isActive && <span class="badge bg-success">Active</span>}
      {children}
    </div>
  );
}

export default MyComponent;
```

**JSX conventions:**

- Use `class` not `className` (Preact convention in this codebase)
- Bootstrap 5 classes for styling
- HTMX attributes: `hx-post`, `hx-get`, `hx-swap`, `hx-target`, `hx-boost`
- Props must be `readonly` (TypeScript convention)

### Database Patterns

**Import and type usage**:

```typescript
import type { Selectable, Insertable, Updateable } from "kysely";
import { db } from "#db/index.js";
import type { User } from "#models/users.js";
import * as UserModel from "#models/users.js";

// Type aliases from models
type SelectableUser = Selectable<User>;
type InsertableUser = Insertable<User>;
```

**Validation with Zod schemas** (defined in model files):

```typescript
const validated = await UserModel.insertSchema.parseAsync(ctx.request.body);
// Zod throws if invalid, error middleware catches it
```

**Query patterns**:

```typescript
// Select
const users = await db
  .selectFrom("users")
  .selectAll()
  .where("is_active", "=", true)
  .orderBy("created_at", "desc")
  .execute();

// Select one
const user = await db
  .selectFrom("users")
  .selectAll()
  .where("id", "=", userId)
  .executeTakeFirst();

if (!user) throw new Error("User not found");

// Insert
const newUser = await db
  .insertInto("users")
  .values({ email, hash, role: "user" })
  .returningAll()
  .executeTakeFirst();

// Update
const updated = await db
  .updateTable("users")
  .set({ first_name: "John", updated_at: new Date() })
  .where("id", "=", userId)
  .returningAll()
  .executeTakeFirst();

// Delete
await db.deleteFrom("users").where("id", "=", userId).execute();
```

### Error Handling

**Throw descriptive errors** (caught by error middleware at `src/middleware/error-handler.tsx`):

```typescript
if (!ctx.state.user) {
  throw new Error("Not logged in");
}

if (!entity) {
  throw new Error("Entity not found");
}
```

**Validation errors**: Let Zod throw, middleware handles it automatically.

### Logging

**NEVER use `console.log()` - XO enforces this rule.**

**Use Pino logger via `ctx.log`:**

```typescript
ctx.log.debug({ user: ctx.state.user }, "User logged in");
ctx.log.info({ entityId: entity.id }, "Entity created");
ctx.log.warn({ attemptedEmail }, "Login attempt with invalid email");
ctx.log.error({ error }, "Database connection failed");
```

### Migration Patterns

**Location**: `src/db/migrations.ts`

**Structure**:

```typescript
export const myMigration: KosmicMigration = {
  sequence: "2025-01-15", // Date-based ordering
  async up(db: Kysely<any>): Promise<void> {
    await db.schema
      .createTable("my_table")
      .$call(addIdColumn)
      .addColumn("name", "varchar(255)", (col) => col.notNull())
      .addColumn("user_id", "integer", (col) =>
        col.references("users.id").onDelete("cascade").notNull(),
      )
      .$call(addTimestampsColumns)
      .execute();

    await createTimestampTrigger(db, "my_table");
  },
  async down(db: Kysely<any>): Promise<void> {
    await dropTimestampTrigger(db, "my_table");
    await db.schema.dropTable("my_table").execute();
  },
};
```

**Helpers available**: `addIdColumn`, `addTimestampsColumns`, `createTimestampTrigger`, `dropTimestampTrigger`

---

## Testing Conventions

- **Test runner**: Node.js built-in (`node:test`)
- **Location**: `test/` directory
- **Pattern**: `*.test.ts` files
- **Imports**: Use `describe`, `test`, `before`, `after` from `node:test`

**Example test structure**:

```typescript
import { describe, test, before, after } from "node:test";
import assert from "node:assert";
import _got from "got";
import * as cheerio from "cheerio";

await describe("feature tests", async () => {
  let server: Server;
  const got = _got.extend({ prefixUrl: "http://localhost:4567" });

  before(async () => {
    server = await createServer();
  });

  after(async () => {
    await server.close();
  });

  await test("should return 200", async () => {
    const response = await got("/", { throwHttpErrors: false });
    assert.strictEqual(response.statusCode, 200);
  });
});
```

**Running single test**: Build first, then run specific file:

```bash
npm run compile:tsc && NODE_ENV=test KOSMIC_ENV=test node --test dist/test/my-feature.test.js
```

---

## Git Commit Conventions

Commitlint enforces [Conventional Commits](https://www.conventionalcommits.org/):

**Format**: `type(scope?): subject`

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`, `revert`

**Examples**:

- `feat(auth): add GitHub OAuth login`
- `fix(entities): handle null description in card component`
- `docs(readme): update installation instructions`
- `refactor(db): extract query helpers to utils`

**Pre-commit hooks** (Husky + lint-staged):

- Runs Prettier on staged markdown files
- Runs XO linter on staged JS/TS files
- Auto-fixes when possible

---

## Common Patterns & Reference

1. **Check existing routes** in `src/routes/**` for patterns before creating new ones
2. **HTMX flows**: Return small partials, not full page refreshes
3. **Bootstrap components**: See existing components in `src/components/**`
4. **Model patterns**: Check `src/models/**` for Zod schemas and type exports
5. **Middleware patterns**: See `src/middleware/**` for auth, routing, error handling

**When in doubt**: Reference `.github/copilot-instructions.md` for detailed architecture and workflow examples.
