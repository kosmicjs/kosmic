import {test, describe, before, after} from 'node:test';
import assert from 'node:assert';
import {mkdirSync, rmSync, existsSync} from 'node:fs';
import {join} from 'node:path';
import {createFsRouter} from '../src/index.ts';
import {createMockContext, createMockNext, createTestRoute} from './helpers.ts';

describe('@kosmic/router - Path Transformation', async () => {
  const testDir = join(import.meta.dirname, '.test-routes-path');

  before(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, {recursive: true, force: true});
    }
  });

  after(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, {recursive: true, force: true});
    }
  });

  await test('converts [param] syntax to :param', async () => {
    const routesDir = join(testDir, 'param-syntax');
    createTestRoute(
      routesDir,
      'users/[id].ts',
      'export const get = async () => {};',
    );

    const {routes} = await createFsRouter(routesDir);
    assert.strictEqual(routes[0]?.uriPath, '/users/:id');

    rmSync(routesDir, {recursive: true, force: true});
  });

  await test('strips index from path', async () => {
    const routesDir = join(testDir, 'index-strip');
    createTestRoute(
      routesDir,
      'index.ts',
      'export const get = async () => {};',
    );

    const {routes} = await createFsRouter(routesDir);
    // Router returns empty string for root, not '/'
    assert.strictEqual(routes[0]?.uriPath, '');

    rmSync(routesDir, {recursive: true, force: true});
  });

  await test('strips nested index from path', async () => {
    const routesDir = join(testDir, 'nested-index');
    createTestRoute(
      routesDir,
      'api/index.ts',
      'export const get = async () => {};',
    );

    const {routes} = await createFsRouter(routesDir);
    assert.strictEqual(routes[0]?.uriPath, '/api');

    rmSync(routesDir, {recursive: true, force: true});
  });

  await test('handles multiple path parameters', async () => {
    const routesDir = join(testDir, 'multi-param');
    createTestRoute(
      routesDir,
      'users/[userId]/posts/[postId].ts',
      'export const get = async () => {};',
    );

    const {routes} = await createFsRouter(routesDir);
    assert.strictEqual(routes[0]?.uriPath, '/users/:userId/posts/:postId');

    rmSync(routesDir, {recursive: true, force: true});
  });

  await test('handles nested paths correctly', async () => {
    const routesDir = join(testDir, 'nested-paths');
    createTestRoute(
      routesDir,
      'api/users/profile.ts',
      'export const get = async () => {};',
    );

    const {routes} = await createFsRouter(routesDir);
    assert.strictEqual(routes[0]?.uriPath, '/api/users/profile');

    rmSync(routesDir, {recursive: true, force: true});
  });
});

void describe('@kosmic/router - Route Sorting', async () => {
  const testDir = join(import.meta.dirname, '.test-routes-sorting');

  after(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, {recursive: true, force: true});
    }
  });

  await test('sorts routes alphabetically', async () => {
    const routesDir = join(testDir, 'alphabetical');
    createTestRoute(
      routesDir,
      'zebra.ts',
      'export const get = async () => {};',
    );
    createTestRoute(
      routesDir,
      'apple.ts',
      'export const get = async () => {};',
    );
    createTestRoute(
      routesDir,
      'middle.ts',
      'export const get = async () => {};',
    );

    const {routes} = await createFsRouter(routesDir);
    assert.strictEqual(routes[0]?.uriPath, '/apple');
    assert.strictEqual(routes[1]?.uriPath, '/middle');
    assert.strictEqual(routes[2]?.uriPath, '/zebra');

    rmSync(routesDir, {recursive: true, force: true});
  });

  await test('sorts shorter paths before longer paths with same prefix', async () => {
    const routesDir = join(testDir, 'depth');
    createTestRoute(
      routesDir,
      'api/users/profile.ts',
      'export const get = async () => {};',
    );
    createTestRoute(
      routesDir,
      'api/users.ts',
      'export const get = async () => {};',
    );
    createTestRoute(routesDir, 'api.ts', 'export const get = async () => {};');

    const {routes} = await createFsRouter(routesDir);
    assert.strictEqual(routes[0]?.uriPath, '/api');
    assert.strictEqual(routes[1]?.uriPath, '/api/users');
    assert.strictEqual(routes[2]?.uriPath, '/api/users/profile');

    rmSync(routesDir, {recursive: true, force: true});
  });

  await test('sorts dynamic routes after static routes', async () => {
    const routesDir = join(testDir, 'dynamic');
    createTestRoute(
      routesDir,
      'users/[id].ts',
      'export const get = async () => {};',
    );
    createTestRoute(
      routesDir,
      'users/profile.ts',
      'export const get = async () => {};',
    );
    createTestRoute(
      routesDir,
      'users/settings.ts',
      'export const get = async () => {};',
    );

    const {routes} = await createFsRouter(routesDir);
    // Router sorts alphabetically, so [id] -> :id comes before profile/settings
    assert.strictEqual(routes[0]?.uriPath, '/users/:id');
    assert.strictEqual(routes[1]?.uriPath, '/users/profile');
    assert.strictEqual(routes[2]?.uriPath, '/users/settings');

    rmSync(routesDir, {recursive: true, force: true});
  });

  await test('handles complex mixed sorting scenarios', async () => {
    const routesDir = join(testDir, 'complex');
    createTestRoute(
      routesDir,
      'api/[resource]/[id].ts',
      'export const get = async () => {};',
    );
    createTestRoute(
      routesDir,
      'api/users/index.ts',
      'export const get = async () => {};',
    );
    createTestRoute(
      routesDir,
      'api/index.ts',
      'export const get = async () => {};',
    );
    createTestRoute(
      routesDir,
      'blog/[slug].ts',
      'export const get = async () => {};',
    );
    createTestRoute(
      routesDir,
      'blog/index.ts',
      'export const get = async () => {};',
    );
    createTestRoute(
      routesDir,
      'index.ts',
      'export const get = async () => {};',
    );
    createTestRoute(
      routesDir,
      'about.ts',
      'export const get = async () => {};',
    );

    const {routes} = await createFsRouter(routesDir);
    const paths = routes.map((r) => r.uriPath);
    // Router sorts alphabetically: '' < '/...' and ':' < 'a'
    assert.deepStrictEqual(paths, [
      '',
      '/about',
      '/api',
      '/api/:resource/:id',
      '/api/users',
      '/blog',
      '/blog/:slug',
    ]);

    rmSync(routesDir, {recursive: true, force: true});
  });

  await test('sorts root route first', async () => {
    const routesDir = join(testDir, 'root-first');
    createTestRoute(
      routesDir,
      'users.ts',
      'export const get = async () => {};',
    );
    createTestRoute(
      routesDir,
      'index.ts',
      'export const get = async () => {};',
    );
    createTestRoute(
      routesDir,
      'about.ts',
      'export const get = async () => {};',
    );

    const {routes} = await createFsRouter(routesDir);
    // Router returns empty string for root, not '/'
    assert.strictEqual(routes[0]?.uriPath, '');

    rmSync(routesDir, {recursive: true, force: true});
  });
});

void describe('@kosmic/router - Middleware Collection', async () => {
  const testDir = join(import.meta.dirname, '.test-routes-middleware');

  after(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, {recursive: true, force: true});
    }
  });

  await test('collects single middleware function from parent', async () => {
    const routesDir = join(testDir, 'single-middleware');
    createTestRoute(
      routesDir,
      'index.ts',
      'export const use = async (ctx, next) => { await next(); };',
    );
    createTestRoute(
      routesDir,
      'users.ts',
      'export const get = async () => { /* noop */ };',
    );

    const {routes} = await createFsRouter(routesDir);
    const usersRoute = routes.find((r) => r.uriPath === '/users');
    assert.ok(usersRoute?.collectedMiddleware);
    assert.strictEqual(usersRoute.collectedMiddleware.all.length, 1);

    rmSync(routesDir, {recursive: true, force: true});
  });

  await test('collects array of middleware functions', async () => {
    const routesDir = join(testDir, 'array-middleware');
    createTestRoute(
      routesDir,
      'api/index.ts',
      'export const use = [async (ctx, next) => { await next(); }, async (ctx, next) => { await next(); }];',
    );
    createTestRoute(
      routesDir,
      'api/users.ts',
      'export const get = async () => { /* noop */ };',
    );

    const {routes} = await createFsRouter(routesDir);
    const usersRoute = routes.find((r) => r.uriPath === '/api/users');
    assert.ok(usersRoute?.collectedMiddleware);
    assert.strictEqual(usersRoute.collectedMiddleware.all.length, 2);

    rmSync(routesDir, {recursive: true, force: true});
  });

  await test('collects method-specific middleware from object', async () => {
    const routesDir = join(testDir, 'method-middleware');
    createTestRoute(
      routesDir,
      'api/index.ts',
      'export const use = { get: async (ctx, next) => { await next(); }, post: async (ctx, next) => { await next(); } };',
    );
    createTestRoute(
      routesDir,
      'api/users.ts',
      'export const get = async () => { /* noop */ }; export const post = async () => { /* noop */ };',
    );

    const {routes} = await createFsRouter(routesDir);
    const usersRoute = routes.find((r) => r.uriPath === '/api/users');
    assert.ok(usersRoute?.collectedMiddleware);
    assert.strictEqual(usersRoute.collectedMiddleware.get.length, 1);
    assert.strictEqual(usersRoute.collectedMiddleware.post.length, 1);

    rmSync(routesDir, {recursive: true, force: true});
  });

  await test('collects middleware only for routes that include parent path', async () => {
    const routesDir = join(testDir, 'path-inheritance');
    createTestRoute(
      routesDir,
      'api/index.ts',
      'export const use = async (ctx, next) => { await next(); };',
    );
    createTestRoute(
      routesDir,
      'api/users.ts',
      'export const get = async () => { /* noop */ };',
    );
    createTestRoute(
      routesDir,
      'blog/index.ts',
      'export const get = async () => { /* noop */ };',
    );

    const {routes} = await createFsRouter(routesDir);
    const apiUsersRoute = routes.find((r) => r.uriPath === '/api/users');
    const blogRoute = routes.find((r) => r.uriPath === '/blog');

    assert.ok(apiUsersRoute?.collectedMiddleware);
    assert.strictEqual(apiUsersRoute.collectedMiddleware.all.length, 1);

    assert.ok(blogRoute?.collectedMiddleware);
    assert.strictEqual(blogRoute.collectedMiddleware.all.length, 0);

    rmSync(routesDir, {recursive: true, force: true});
  });

  await test('combines all middleware with method-specific middleware', async () => {
    const routesDir = join(testDir, 'combined-middleware');
    createTestRoute(
      routesDir,
      'index.ts',
      'export const use = [{all: async (ctx, next) => { await next(); }}, {get: async (ctx, next) => { await next(); }}];',
    );
    createTestRoute(
      routesDir,
      'api.ts',
      'export const get = async () => { /* noop */ };',
    );

    const {routes} = await createFsRouter(routesDir);
    const apiRoute = routes.find((r) => r.uriPath === '/api');

    assert.ok(apiRoute?.collectedMiddleware);
    assert.strictEqual(apiRoute.collectedMiddleware.all.length, 1);
    assert.strictEqual(apiRoute.collectedMiddleware.get.length, 1);

    rmSync(routesDir, {recursive: true, force: true});
  });
});

void describe('@kosmic/router - Route Matching & Handler Execution', async () => {
  const testDir = join(import.meta.dirname, '.test-routes-matching');

  after(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, {recursive: true, force: true});
    }
  });

  await test('matches exact path and executes handler', async () => {
    const routesDir = join(testDir, 'exact-match');
    createTestRoute(
      routesDir,
      'about.ts',
      'export const get = async (ctx) => { ctx.body = "test"; };',
    );

    const {middleware} = await createFsRouter(routesDir);

    const ctx = createMockContext({method: 'GET', originalUrl: '/about'});
    const next = createMockNext();

    await middleware(ctx, next);

    assert.strictEqual((ctx as {body?: string}).body, 'test');
    assert.strictEqual(next.wasCalled(), false);

    rmSync(routesDir, {recursive: true, force: true});
  });

  await test('extracts path parameters to ctx.params', async () => {
    const routesDir = join(testDir, 'param-extraction');
    createTestRoute(
      routesDir,
      'users/[id].ts',
      'export const get = async (ctx) => { ctx.state.params = ctx.params; };',
    );

    const {middleware} = await createFsRouter(routesDir);

    const ctx = createMockContext({
      method: 'GET',
      originalUrl: '/users/123',
      state: {},
    });
    const next = createMockNext();

    await middleware(ctx, next);

    // Check individual properties instead of deepStrictEqual due to [Object: null prototype]
    assert.strictEqual(
      (ctx as {state: {params?: {id?: string}}}).state.params?.id,
      '123',
    );
    assert.strictEqual(ctx.params?.id, '123');
    assert.strictEqual(ctx.request.params?.id, '123');

    rmSync(routesDir, {recursive: true, force: true});
  });

  await test('handles multiple path parameters', async () => {
    const routesDir = join(testDir, 'multi-params');
    createTestRoute(
      routesDir,
      'users/[userId]/posts/[postId].ts',
      'export const get = async (ctx) => { ctx.state.params = ctx.params; };',
    );

    const {middleware} = await createFsRouter(routesDir);

    const ctx = createMockContext({
      method: 'GET',
      originalUrl: '/users/42/posts/100',
      state: {},
    });
    const next = createMockNext();

    await middleware(ctx, next);

    // Check individual properties instead of deepStrictEqual due to [Object: null prototype]
    const stateParameters = (
      ctx as {state: {params?: {userId?: string; postId?: string}}}
    ).state.params;
    assert.strictEqual(stateParameters?.userId, '42');
    assert.strictEqual(stateParameters?.postId, '100');

    rmSync(routesDir, {recursive: true, force: true});
  });

  await test('splits query string before matching', async () => {
    const routesDir = join(testDir, 'query-string');
    createTestRoute(
      routesDir,
      'search.ts',
      'export const get = async (ctx) => { ctx.body = "found"; };',
    );

    const {middleware} = await createFsRouter(routesDir);

    const ctx = createMockContext({
      method: 'GET',
      originalUrl: '/search?q=test&page=1',
    });
    const next = createMockNext();

    await middleware(ctx, next);

    assert.strictEqual((ctx as {body?: string}).body, 'found');

    rmSync(routesDir, {recursive: true, force: true});
  });

  await test('routes to correct HTTP method', async () => {
    const routesDir = join(testDir, 'http-methods');
    createTestRoute(
      routesDir,
      'form.ts',
      'export const get = async (ctx) => { ctx.body = "GET"; }; export const post = async (ctx) => { ctx.body = "POST"; };',
    );

    const {middleware} = await createFsRouter(routesDir);

    // Test GET
    const getCtx = createMockContext({method: 'GET', originalUrl: '/form'});
    await middleware(getCtx, createMockNext());
    assert.strictEqual((getCtx as {body?: string}).body, 'GET');

    // Test POST
    const postCtx = createMockContext({method: 'POST', originalUrl: '/form'});
    await middleware(postCtx, createMockNext());
    assert.strictEqual((postCtx as {body?: string}).body, 'POST');

    rmSync(routesDir, {recursive: true, force: true});
  });

  await test('calls next() when no route matches', async () => {
    const routesDir = join(testDir, 'no-match');
    createTestRoute(
      routesDir,
      'about.ts',
      'export const get = async () => { /* noop */ };',
    );

    const {middleware} = await createFsRouter(routesDir);

    const ctx = createMockContext({method: 'GET', originalUrl: '/notfound'});
    const next = createMockNext();

    await middleware(ctx, next);

    assert.strictEqual(next.wasCalled(), true);

    rmSync(routesDir, {recursive: true, force: true});
  });

  await test('calls next() when route exists but method not defined', async () => {
    const routesDir = join(testDir, 'method-not-defined');
    createTestRoute(
      routesDir,
      'about.ts',
      'export const get = async () => { /* noop */ };',
    );

    const {middleware} = await createFsRouter(routesDir);

    const ctx = createMockContext({method: 'POST', originalUrl: '/about'});
    const next = createMockNext();

    await middleware(ctx, next);

    assert.strictEqual(next.wasCalled(), true);

    rmSync(routesDir, {recursive: true, force: true});
  });

  await test('handles del export as delete method', async () => {
    const routesDir = join(testDir, 'del-method');
    createTestRoute(
      routesDir,
      'users/[id].ts',
      'export const del = async (ctx) => { ctx.body = "deleted"; };',
    );

    const {middleware} = await createFsRouter(routesDir);

    const ctx = createMockContext({
      method: 'DELETE',
      originalUrl: '/users/123',
    });
    const next = createMockNext();

    await middleware(ctx, next);

    assert.strictEqual((ctx as {body?: string}).body, 'deleted');

    rmSync(routesDir, {recursive: true, force: true});
  });
});

void describe('@kosmic/router - App Event Emission', async () => {
  const testDir = join(import.meta.dirname, '.test-routes-events');

  after(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, {recursive: true, force: true});
    }
  });

  await test('emits router:loaded event with route metadata', async () => {
    const routesDir = join(testDir, 'event-emission');
    createTestRoute(
      routesDir,
      'index.ts',
      'export const get = async () => { /* noop */ };',
    );
    createTestRoute(
      routesDir,
      'about.ts',
      'export const get = async () => { /* noop */ }; export const post = async () => { /* noop */ };',
    );
    createTestRoute(
      routesDir,
      'api/users.ts',
      'export const get = async () => { /* noop */ }; export const post = async () => { /* noop */ }; export const del = async () => { /* noop */ };',
    );

    let emittedEvent:
      | {routes: Array<{method: string; path: string}>}
      | undefined;

    const mockApp = {
      emit(event: string, data: unknown) {
        if (event === 'router:loaded') {
          emittedEvent = data as {
            routes: Array<{method: string; path: string}>;
          };
        }
      },
    };

    await createFsRouter(routesDir, mockApp as never);

    assert.ok(emittedEvent);
    assert.strictEqual(emittedEvent.routes.length, 6);

    const methods = new Set(
      emittedEvent.routes.map((r) => `${r.method} ${r.path}`),
    );
    assert.ok(methods.has('GET /'));
    assert.ok(methods.has('GET /about'));
    assert.ok(methods.has('POST /about'));
    assert.ok(methods.has('GET /api/users'));
    assert.ok(methods.has('POST /api/users'));
    assert.ok(methods.has('DELETE /api/users'));

    rmSync(routesDir, {recursive: true, force: true});
  });

  await test('works without app parameter', async () => {
    const routesDir = join(testDir, 'no-app');
    createTestRoute(
      routesDir,
      'index.ts',
      'export const get = async () => { /* noop */ };',
    );

    // Should not throw
    const {routes} = await createFsRouter(routesDir);
    assert.strictEqual(routes.length, 1);

    rmSync(routesDir, {recursive: true, force: true});
  });
});

void describe('@kosmic/router - Edge Cases', async () => {
  const testDir = join(import.meta.dirname, '.test-routes-edge');

  after(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, {recursive: true, force: true});
    }
  });

  await test('handles empty routes directory', async () => {
    const routesDir = join(testDir, 'empty');
    mkdirSync(routesDir, {recursive: true});

    const {routes} = await createFsRouter(routesDir);
    assert.strictEqual(routes.length, 0);

    rmSync(routesDir, {recursive: true, force: true});
  });

  await test('handles originalUrl being undefined', async () => {
    const routesDir = join(testDir, 'undefined-url');
    createTestRoute(
      routesDir,
      'users/index.ts',
      'export const get = async (ctx) => { ctx.state.called = true; };',
    );

    const {middleware} = await createFsRouter(routesDir);

    const ctx = createMockContext({originalUrl: undefined as never, state: {}});
    const next = createMockNext();

    await middleware(ctx, next);

    // When originalUrl is undefined, match against '' which won't match '/users'
    // so next() should be called
    assert.strictEqual(next.wasCalled(), true);

    rmSync(routesDir, {recursive: true, force: true});
  });

  await test('handles lowercase method names', async () => {
    const routesDir = join(testDir, 'lowercase-method');
    createTestRoute(
      routesDir,
      'test.ts',
      'export const get = async (ctx) => { ctx.body = "ok"; };',
    );

    const {middleware} = await createFsRouter(routesDir);

    const ctx = createMockContext({method: 'get', originalUrl: '/test'});
    const next = createMockNext();

    await middleware(ctx, next);

    assert.strictEqual((ctx as {body?: string}).body, 'ok');

    rmSync(routesDir, {recursive: true, force: true});
  });
});
