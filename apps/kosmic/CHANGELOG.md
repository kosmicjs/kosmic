# kosmic

## 0.0.7

### Patch Changes

- Updated dependencies
- Updated dependencies
  - @kosmic/auth@0.2.0
  - @kosmic/cli@0.2.0
  - @kosmic/config@0.1.0
  - @kosmic/db@0.2.0
  - @kosmic/logger@0.1.0
  - @kosmic/router@0.1.0
  - @kosmic/server@0.4.0

## 0.0.6

### Patch Changes

- Updated dependencies
  - @kosmic/auth@0.1.0
  - @kosmic/cli@0.1.0
  - @kosmic/db@0.1.0
  - @kosmic/server@0.3.0

## 0.0.5

### Patch Changes

- Updated dependencies
  - @kosmic/auth@0.0.4
  - @kosmic/cli@0.0.4
  - @kosmic/core@0.0.4
  - @kosmic/db@0.0.4
  - @kosmic/logger@0.0.4
  - @kosmic/server@0.2.3

## 0.0.4

### Patch Changes

- Updated dependencies
  - @kosmic/auth@0.0.3
  - @kosmic/db@0.0.3
  - @kosmic/logger@0.0.3
  - @kosmic/server@0.2.1
  - @kosmic/core@0.0.3

## 0.0.3

### Patch Changes

- Server bootstrap migration

  Extract app server bootstrap logic into `@kosmic/server` with an injected factory API, and migrate `apps/kosmic/src/server.ts` to a thin compatibility shim.

  **@kosmic/server**
  - Add reusable Koa bootstrap API via `createServerApp`, `createServer`, and `getCtx`.
  - Move middleware pipeline wiring from the app into package internals:
    - response time
    - static files
    - production Vite manifest loading
    - pino request logger
    - conditional get / etag / bodyparser
    - JSX render middleware
    - error handler
    - session + passport wiring
    - fs-router wiring
    - helmet defaults
    - app event logging hooks (`session:*`, `router:loaded`)
  - Support app-level dependency injection for logger, env, session store, passport, directories, and middleware hooks.
  - Add focused package tests covering pipeline order, production manifest behavior, `getCtx`, session/passport/router attachment, and event logging.

  **kosmic**
  - Replace app-local server bootstrap implementation with a thin shim that calls into `@kosmic/server` while preserving `#server` import compatibility.
  - Rebalance dependencies so bootstrap-owned middleware dependencies are owned by `@kosmic/server`.

- Updated dependencies
- Updated dependencies
- Updated dependencies
  - @kosmic/auth@0.0.2
  - @kosmic/cli@0.0.3
  - @kosmic/config@0.0.2
  - @kosmic/core@0.0.2
  - @kosmic/db@0.0.2
  - @kosmic/logger@0.0.2
  - @kosmic/router@0.0.2
  - @kosmic/server@0.2.0

## 0.0.2

### Patch Changes

- Updated dependencies
  - @kosmic/cli@0.0.2

## 0.0.1

### Patch Changes

- initial commit
- Server bootstrap migration

  Extract app server bootstrap logic into `@kosmic/server` with an injected factory API, and migrate `apps/kosmic/src/server.ts` to a thin compatibility shim.

  **@kosmic/server**
  - Add reusable Koa bootstrap API via `createServerApp`, `createServer`, and `getCtx`.
  - Move middleware pipeline wiring from the app into package internals:
    - response time
    - static files
    - production Vite manifest loading
    - pino request logger
    - conditional get / etag / bodyparser
    - JSX render middleware
    - error handler
    - session + passport wiring
    - fs-router wiring
    - helmet defaults
    - app event logging hooks (`session:*`, `router:loaded`)
  - Support app-level dependency injection for logger, env, session store, passport, directories, and middleware hooks.
  - Add focused package tests covering pipeline order, production manifest behavior, `getCtx`, session/passport/router attachment, and event logging.

  **kosmic**
  - Replace app-local server bootstrap implementation with a thin shim that calls into `@kosmic/server` while preserving `#server` import compatibility.
  - Rebalance dependencies so bootstrap-owned middleware dependencies are owned by `@kosmic/server`.

- Updated dependencies
- Updated dependencies
  - @kosmic/auth@0.0.1
  - @kosmic/cli@0.0.1
  - @kosmic/config@0.0.1
  - @kosmic/core@0.0.1
  - @kosmic/db@0.0.1
  - @kosmic/logger@0.0.1
  - @kosmic/router@0.0.1
  - @kosmic/server@0.1.0
