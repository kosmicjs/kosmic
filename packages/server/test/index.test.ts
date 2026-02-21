import {test, describe} from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import Koa, {type Middleware} from 'koa';
import {
  createServerApp,
  getCtx,
  type CreateServerAppOptions,
  type PassportLike,
  type ServerInternals,
} from '../src/index.ts';

function createLoggerMock() {
  const warnings: string[] = [];
  const debugLogs: string[] = [];
  const errors: unknown[] = [];

  return {
    logger: {
      warn(_object: unknown, message?: string) {
        warnings.push(message ?? '');
      },
      debug(_object: unknown, message?: string) {
        debugLogs.push(message ?? '');
      },
      error(error: unknown) {
        errors.push(error);
      },
    },
    warnings,
    debugLogs,
    errors,
  };
}

function createBaseOptions(app: Koa): CreateServerAppOptions {
  const {logger} = createLoggerMock();

  const routerMiddleware: Middleware = async (ctx, next) => {
    ctx.status = 204;
    await next();
  };

  const passThroughMiddleware: Middleware = async (_ctx, next) => {
    await next();
  };

  return {
    logger,
    env: {
      nodeEnv: 'test',
      kosmicEnv: 'test',
      sessionKeys: ['test-key'],
    },
    routesDir: '/tmp/routes',
    publicDir: '/tmp/public',
    internals: {
      createFsRouter: async () => ({
        middleware: routerMiddleware,
        routes: [],
      }),
      createPinoMiddleware: () => passThroughMiddleware,
      createHelmetMiddleware: () => passThroughMiddleware,
    },
  };
}

async function makeRequest(app: Koa): Promise<number> {
  const server = http.createServer(app.callback());

  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      resolve();
    });
  });

  const address = server.address();

  if (!address || typeof address === 'string') {
    throw new TypeError('Unexpected server address');
  }

  const response = await fetch(`http://127.0.0.1:${address.port}`);
  const {status} = response;

  server.closeAllConnections();
  await new Promise<void>((resolve) => {
    server.close(() => {
      resolve();
    });
  });

  return status;
}

void describe('@kosmic/server', async () => {
  await test('registers middleware pipeline and preserves critical order', async () => {
    const app = new Koa({asyncLocalStorage: true});
    const beforeCore: Middleware = async (_ctx, next) => {
      await next();
    };

    const afterCore: Middleware = async (_ctx, next) => {
      await next();
    };

    const beforeRoutes: Middleware = async (_ctx, next) => {
      await next();
    };

    const afterRoutes: Middleware = async (_ctx, next) => {
      await next();
    };

    const options = createBaseOptions(app);
    options.middlewares = {
      beforeCore: [beforeCore],
      afterCore: [afterCore],
      beforeRoutes: [beforeRoutes],
      afterRoutes: [afterRoutes],
    };

    await createServerApp(options);

    const beforeCoreIndex = app.middleware.indexOf(beforeCore);
    const afterCoreIndex = app.middleware.indexOf(afterCore);
    const beforeRoutesIndex = app.middleware.indexOf(beforeRoutes);
    const afterRoutesIndex = app.middleware.indexOf(afterRoutes);

    assert.ok(beforeCoreIndex !== -1);
    assert.ok(afterCoreIndex > beforeCoreIndex);
    assert.ok(beforeRoutesIndex > afterCoreIndex);
    assert.ok(afterRoutesIndex > beforeRoutesIndex);
  });

  await test('loads manifest in production but not in non-production', async () => {
    const appProd = new Koa({asyncLocalStorage: true});
    const optionsProd = createBaseOptions(appProd);

    const manifest = {
      entry: {css: [], file: 'entry.js', isEntry: true, src: 'entry.ts'},
    };
    optionsProd.env.kosmicEnv = 'production';
    optionsProd.internals = {
      ...optionsProd.internals,
      readFile: async (_filePath, _encoding) => JSON.stringify(manifest),
      createFsRouter: async () => ({
        async middleware(ctx) {
          ctx.status = ctx.state.manifest ? 200 : 500;
        },
        routes: [],
      }),
    };

    await createServerApp(optionsProd);
    const prodStatus = await makeRequest(appProd);
    assert.strictEqual(prodStatus, 200);

    const appDev = new Koa({asyncLocalStorage: true});
    const optionsDev = createBaseOptions(appDev);
    optionsDev.env.kosmicEnv = 'development';
    optionsDev.internals = {
      ...optionsDev.internals,
      async readFile(_filePath, _encoding) {
        throw new Error('readFile should not be called in development');
      },
      createFsRouter: async () => ({
        async middleware(ctx) {
          ctx.status = ctx.state.manifest ? 500 : 200;
        },
        routes: [],
      }),
    };

    await createServerApp(optionsDev);
    const devStatus = await makeRequest(appDev);
    assert.strictEqual(devStatus, 200);
  });

  await test('getCtx throws when no context and succeeds during request', async () => {
    const app = new Koa({asyncLocalStorage: true});
    const options = createBaseOptions(app);

    assert.throws(() => {
      getCtx();
    }, /No context found/u);

    options.internals = {
      ...options.internals,
      createFsRouter: async () => ({
        async middleware(ctx) {
          ctx.status = getCtx() === ctx ? 200 : 500;
        },
        routes: [],
      }),
    };

    await createServerApp(options);
    const status = await makeRequest(app);
    assert.strictEqual(status, 200);
  });

  await test('attaches session, passport, and router middleware when provided', async () => {
    const app = new Koa({asyncLocalStorage: true});
    const options = createBaseOptions(app);

    let sessionFactoryCallCount = 0;
    const sessionMiddleware: Middleware = async (_ctx, next) => {
      await next();
    };

    const passportInit: Middleware = async (_ctx, next) => {
      await next();
    };

    const passportSession: Middleware = async (_ctx, next) => {
      await next();
    };

    const routerMiddleware: Middleware = async (_ctx, next) => {
      await next();
    };

    const passport: PassportLike = {
      initialize: () => passportInit,
      session: () => passportSession,
    };

    options.sessionStore = {
      async get() {
        return undefined;
      },
      async set() {
        return undefined;
      },
      async destroy() {
        return undefined;
      },
    };

    options.passport = passport;

    options.internals = {
      ...options.internals,
      createSessionMiddleware: (() => {
        return (
          _sessionOptions: Record<string, unknown>,
          _app: Koa,
        ): Middleware => {
          sessionFactoryCallCount++;
          return sessionMiddleware;
        };
      })() as NonNullable<ServerInternals['createSessionMiddleware']>,
      createFsRouter: async () => ({
        middleware: routerMiddleware,
        routes: [],
      }),
    };

    await createServerApp(options);

    assert.strictEqual(sessionFactoryCallCount, 1);
    assert.ok(app.middleware.includes(sessionMiddleware));
    assert.ok(app.middleware.includes(passportInit));
    assert.ok(app.middleware.includes(passportSession));
    assert.ok(app.middleware.includes(routerMiddleware));
  });

  await test('logs session and router events', async () => {
    const app = new Koa({asyncLocalStorage: true});
    const {logger, warnings, debugLogs} = createLoggerMock();
    const options = createBaseOptions(app);
    options.logger = logger;

    await createServerApp(options);

    app.emit('session:missed', {id: '1'});
    app.emit('session:invalid', {id: '2'});
    app.emit('session:expired', {id: '3'});
    app.emit('router:loaded', {routes: []});

    assert.deepStrictEqual(warnings, [
      'session:missed',
      'session:invalid',
      'session:expired',
    ]);
    assert.deepStrictEqual(debugLogs, ['router:loaded']);
  });
});
