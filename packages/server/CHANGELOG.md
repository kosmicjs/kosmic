# @kosmic/server

## 0.1.0

### Minor Changes

- # Server bootstrap migration

  Extract app server bootstrap logic into `@kosmic/server` with an injected factory API, and migrate `apps/kosmic/src/server.ts` to a thin compatibility shim.

  ## `@kosmic/server`
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

  ## `kosmic`
  - Replace app-local server bootstrap implementation with a thin shim that calls into `@kosmic/server` while preserving `#server` import compatibility.
  - Rebalance dependencies so bootstrap-owned middleware dependencies are owned by `@kosmic/server`.

### Patch Changes

- initial commit
- Updated dependencies
  - @kosmic/config@0.0.1
  - @kosmic/error-handler@0.0.1
  - @kosmic/helmet@0.0.1
  - @kosmic/jsx@0.0.1
  - @kosmic/logger@0.0.1
  - @kosmic/router@0.0.1
