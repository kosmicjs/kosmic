import http, {type Server} from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import bodyParser from 'koa-bodyparser';
import responseTime from 'koa-response-time';
import session from 'koa-session';
import etag from '@koa/etag';
import conditional from 'koa-conditional-get';
import Koa, {type Context} from 'koa';
import serve from 'koa-static';
import {KyselySessionStore} from '#utils/kysely-session-store.js';
import {renderMiddleware} from '#middleware/jsx.middleware.js';
import {helmetMiddleware} from '#middleware/helmet.js';
import {createPinoMiddleware} from '#middleware/pino-http.js';
import {errorHandler} from '#middleware/error-handler.js';
import createFsRouter from '#middleware/router/index.js';
import logger from '#utils/logger.js';
import {config} from '#config/index.js';
import {passport} from '#middleware/passport.js';
import {type RouteDefinition} from '#middleware/router/types.js';

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
  if (config.kosmicEnv === 'production') {
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

  app.keys = config.sessionKeys;

  app.proxy = config.kosmicEnv === 'production';

  app.use(
    session(
      {
        secure: config.kosmicEnv === 'production',
        sameSite: 'lax',
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
  const {middleware: fsRouterMiddleware} = await createFsRouter(routesDir, app);
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

app.on('router:loaded', (ev: {routes: RouteDefinition[]}) => {
  logger.debug({routes: ev.routes}, 'router:loaded');
});
