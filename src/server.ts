import http, {type Server} from 'node:http';
import fs from 'node:fs/promises';
import process from 'node:process';
import path from 'node:path';
import bodyParser from 'koa-bodyparser';
import responseTime from 'koa-response-time';
import session from 'koa-session';
import etag from 'koa-etag';
import conditional from 'koa-conditional-get';
import Koa, {type Context} from 'koa';
import serve from 'koa-static';
import {RateLimit} from 'koa2-ratelimit';
import MemoryStore from 'koa2-ratelimit/src/MemoryStore.js';
import {KyselySessionStore} from '#utils/kysely-session-store.js';
import {renderMiddleware} from '#middleware/jsx.middleware.js';
import {helmetMiddleware} from '#middleware/helmet.js';
import {createPinoMiddleware} from '#middleware/pino-http.js';
import {errorHandler} from '#middleware/error-handler.js';
import createFsRouter from '#middleware/router/index.js';
import logger from '#utils/logger.js';
import {config} from '#config/index.js';
import {passport} from '#middleware/passport.js';
import {KyselyRateLimitStore} from '#utils/kysely-rate-limit-store.js';

type Logger = typeof logger;

type Manifest = Record<
  string,
  {
    css: string[];
    file: string;
    isEntry: boolean;
    src: string;
  }
>;
declare module 'koa' {
  interface DefaultContext {
    id: number | string;
    log: Logger;
  }

  interface Request {
    log: Logger;
  }

  interface DefaultState {
    manifest?: Manifest;
  }

  interface Response {
    log: Logger;
  }
}

export const app = new Koa({asyncLocalStorage: true});

export async function createServer(): Promise<Server> {
  // add x-response-time header
  app.use(responseTime());

  // serve static files from public dir
  app.use(serve(path.join(import.meta.dirname, 'public')));

  // add manifest to state for prod
  if (process.env.NODE_ENV === 'production') {
    app.use(async (ctx, next) => {
      const manifest = JSON.parse(
        await fs.readFile(
          path.join(import.meta.dirname, 'public', '.vite', 'manifest.json'),
          'utf8',
        ),
      ) as Manifest;
      ctx.state.manifest = manifest;
      await next();
    });
  }

  // add pino logger
  app.use(createPinoMiddleware({logger}));

  // koa essentials
  app.use(conditional());
  app.use(etag());
  app.use(bodyParser());

  // jsx rendering middleware
  app.use(renderMiddleware);

  // error handler
  app.use(errorHandler());

  app.use(
    RateLimit.middleware({
      max: 100,
      message: 'Too many requests, please try again later.',
      store:
        config.kosmicEnv === 'test'
          ? new MemoryStore()
          : new KyselyRateLimitStore(),
    }),
  );

  app.keys = config.sessionKeys;

  app.use(
    session(
      {
        store: new KyselySessionStore(),
      },
      app,
    ),
  );
  // passport auth
  app.use(passport.initialize({userProperty: 'email'}));
  app.use(passport.session());

  // add fs routes
  const routesDir = path.join(import.meta.dirname, 'routes');
  const {middleware: fsRouterMiddleware} = await createFsRouter(routesDir);
  app.use(fsRouterMiddleware);

  // security headers
  app.use(helmetMiddleware);

  const server: Server = http.createServer(app.callback());

  return server;
}

export const getCtx = () => {
  const ctx = app.currentContext;
  if (!ctx) throw new Error('No context found');
  return ctx as Context;
};

app.on('session:missed', (...ev) => {
  logger.warn({...ev}, 'session:missed');
});

app.on('session:invalid', (...ev) => {
  logger.warn({...ev}, 'session:invalid');
});

app.on('session:expired', (...ev) => {
  logger.warn({...ev}, 'session:expired');
});
