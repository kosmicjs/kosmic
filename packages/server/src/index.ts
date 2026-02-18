import http, {type Server} from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import type Koa from 'koa';
import type {Context, Middleware} from 'koa';
import bodyParser from 'koa-bodyparser';
import conditional from 'koa-conditional-get';
import responseTime from 'koa-response-time';
import session, {type stores as SessionStore} from 'koa-session';
import serve from 'koa-static';
import etag from '@koa/etag';
import {errorHandler} from '@kosmic/error-handler';
import {createHelmetMiddleware, type HelmetOptions} from '@kosmic/helmet';
import {renderMiddleware} from '@kosmic/jsx';
import {createPinoMiddleware} from '@kosmic/pino-http';
import {createFsRouter, type RouteDefinition} from '@kosmic/router';

export type Manifest = Record<
  string,
  {
    css: string[];
    file: string;
    isEntry: boolean;
    src: string;
  }
>;

export type LoggerLike = {
  debug: (object: unknown, message?: string) => void;
  warn: (object: unknown, message?: string) => void;
  error: (error: unknown) => void;
};

export type PassportLike = {
  initialize: (options?: {userProperty: string}) => Middleware;
  session: () => Middleware;
};

export type ServerEnvironment = {
  nodeEnv: 'production' | 'development' | 'test';
  kosmicEnv: string;
  sessionKeys: string[];
};

type RouterLoadedRoute = {
  method: string;
  path: string;
};

type ContentSecurityPolicyOptions = Exclude<
  HelmetOptions['contentSecurityPolicy'],
  boolean
>;

type ContentSecurityPolicy = NonNullable<ContentSecurityPolicyOptions>;

type ContentSecurityPolicyDirectives = NonNullable<
  ContentSecurityPolicy['directives']
>;

export type ServerMiddlewareHooks = {
  beforeCore?: Middleware[];
  afterCore?: Middleware[];
  beforeRoutes?: Middleware[];
  afterRoutes?: Middleware[];
};

export type ServerInternals = {
  readFile?: (filePath: string, encoding: BufferEncoding) => Promise<string>;
  createFsRouter?: typeof createFsRouter;
  createPinoMiddleware?: typeof createPinoMiddleware;
  createHelmetMiddleware?: typeof createHelmetMiddleware;
  createSessionMiddleware?: typeof session;
};

export type CreateServerAppOptions = {
  app: Koa;
  logger: LoggerLike;
  env: ServerEnvironment;
  routesDir: string;
  publicDir: string;
  manifestPath?: string;
  sessionStore?: SessionStore;
  passport?: PassportLike;
  helmetOptions?: HelmetOptions;
  sessionOptions?: Omit<session.opts, 'store'>;
  middlewares?: ServerMiddlewareHooks;
  internals?: ServerInternals;
};

declare module 'koa' {
  interface Request {
    body?: unknown;
    rawBody: string;
  }

  interface DefaultState {
    manifest?: Manifest;
  }
}

const configuredApps = new WeakSet<Koa>();

function createDefaultHelmetDirectives(
  kosmicEnv: string,
): ContentSecurityPolicyDirectives {
  return {
    'upgrade-insecure-requests': kosmicEnv === 'development' ? null : [],
    'script-src': [
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      'http://localhost:5173',
    ],
    'connect-src': [
      "'self'",
      'http://127.0.0.1:2222',
      'ws://127.0.0.1:2222',
      'ws://localhost:5173',
    ],
  };
}

function mergeHelmetOptions(
  kosmicEnv: string,
  helmetOptions?: HelmetOptions,
): HelmetOptions {
  const defaultDirectives = createDefaultHelmetDirectives(kosmicEnv);

  let providedCsp: ContentSecurityPolicy | undefined;

  if (typeof helmetOptions?.contentSecurityPolicy === 'object') {
    providedCsp = helmetOptions.contentSecurityPolicy;
  }

  const providedDirectives = providedCsp?.directives;

  return {
    ...helmetOptions,
    contentSecurityPolicy: {
      ...providedCsp,
      directives: {
        ...defaultDirectives,
        ...providedDirectives,
      },
    },
  };
}

function useMiddlewares(app: Koa, middlewares: Middleware[]): void {
  for (const middleware of middlewares) {
    app.use(middleware);
  }
}

function attachCoreMiddleware(
  app: Koa,
  options: {
    env: ServerEnvironment;
    logger: LoggerLike;
    publicDir: string;
    manifestPath: string;
    readFile: NonNullable<ServerInternals['readFile']>;
    pinoMiddlewareFactory: NonNullable<ServerInternals['createPinoMiddleware']>;
  },
): void {
  app.use(responseTime());

  app.use(serve(options.publicDir));

  if (options.env.kosmicEnv === 'production') {
    app.use(async (ctx, next) => {
      const manifest = JSON.parse(
        await options.readFile(options.manifestPath, 'utf8'),
      ) as Manifest;
      ctx.state.manifest = manifest;
      await next();
    });
  }

  app.use(
    options.pinoMiddlewareFactory(
      {logger: options.logger} as Parameters<typeof createPinoMiddleware>[0],
      {environment: options.env.nodeEnv},
    ),
  );

  app.use(conditional());
  app.use(etag());
  app.use(bodyParser());
  app.use(renderMiddleware);
  app.use(errorHandler({logger: options.logger}));
}

function attachSessionAndPassport(
  app: Koa,
  options: {
    env: ServerEnvironment;
    sessionStore?: SessionStore | undefined;
    sessionOptions?: Omit<session.opts, 'store'> | undefined;
    passport?: PassportLike | undefined;
    sessionMiddlewareFactory: NonNullable<
      ServerInternals['createSessionMiddleware']
    >;
  },
): void {
  app.keys = options.env.sessionKeys;
  app.proxy = options.env.kosmicEnv === 'production';

  if (options.sessionStore) {
    app.use(
      options.sessionMiddlewareFactory(
        {
          secure: options.env.kosmicEnv === 'production',
          sameSite: 'lax',
          ...options.sessionOptions,
          store: options.sessionStore,
        },
        app,
      ),
    );
  }

  if (options.passport) {
    app.use(options.passport.initialize({userProperty: 'email'}));
    app.use(options.passport.session());
  }
}

function getResolvedInternals(internals?: ServerInternals): {
  readFile: NonNullable<ServerInternals['readFile']>;
  fsRouterFactory: NonNullable<ServerInternals['createFsRouter']>;
  pinoMiddlewareFactory: NonNullable<ServerInternals['createPinoMiddleware']>;
  helmetMiddlewareFactory: NonNullable<
    ServerInternals['createHelmetMiddleware']
  >;
  sessionMiddlewareFactory: NonNullable<
    ServerInternals['createSessionMiddleware']
  >;
} {
  return {
    readFile: internals?.readFile ?? fs.readFile,
    fsRouterFactory: internals?.createFsRouter ?? createFsRouter,
    pinoMiddlewareFactory:
      internals?.createPinoMiddleware ?? createPinoMiddleware,
    helmetMiddlewareFactory:
      internals?.createHelmetMiddleware ?? createHelmetMiddleware,
    sessionMiddlewareFactory: internals?.createSessionMiddleware ?? session,
  };
}

function attachAppEventLogging(app: Koa, logger: LoggerLike): void {
  app.on('session:missed', (...ev) => {
    logger.warn({...ev}, 'session:missed');
  });

  app.on('session:invalid', (...ev) => {
    logger.warn({...ev}, 'session:invalid');
  });

  app.on('session:expired', (...ev) => {
    logger.warn({...ev}, 'session:expired');
  });

  app.on('router:loaded', (ev: {routes: RouterLoadedRoute[]}) => {
    logger.debug({routes: ev.routes}, 'router:loaded');
  });
}

export async function createServerApp(
  options: CreateServerAppOptions,
): Promise<Koa> {
  const {
    app,
    logger,
    env,
    routesDir,
    publicDir,
    manifestPath = path.join(publicDir, '.vite', 'manifest.json'),
    sessionStore,
    passport,
    helmetOptions,
    sessionOptions,
    middlewares,
    internals,
  } = options;

  if (configuredApps.has(app)) {
    return app;
  }

  const {
    readFile,
    fsRouterFactory,
    pinoMiddlewareFactory,
    helmetMiddlewareFactory,
    sessionMiddlewareFactory,
  } = getResolvedInternals(internals);

  attachCoreMiddleware(app, {
    env,
    logger,
    publicDir,
    manifestPath,
    readFile,
    pinoMiddlewareFactory,
  });

  useMiddlewares(app, middlewares?.beforeCore ?? []);

  attachSessionAndPassport(app, {
    env,
    sessionStore,
    sessionOptions,
    passport,
    sessionMiddlewareFactory,
  });

  useMiddlewares(app, middlewares?.afterCore ?? []);
  useMiddlewares(app, middlewares?.beforeRoutes ?? []);

  const {middleware: fsRouterMiddleware} = await fsRouterFactory(
    routesDir,
    app,
  );
  app.use(fsRouterMiddleware);

  useMiddlewares(app, middlewares?.afterRoutes ?? []);

  app.use(
    helmetMiddlewareFactory(mergeHelmetOptions(env.kosmicEnv, helmetOptions)),
  );

  attachAppEventLogging(app, logger);
  configuredApps.add(app);

  return app;
}

export async function createServer(
  options: CreateServerAppOptions,
): Promise<Server> {
  const app = await createServerApp(options);

  return http.createServer(app.callback());
}

export function getCtx(app: Pick<Koa, 'currentContext'>): Context {
  const ctx = app.currentContext;

  if (!ctx) {
    throw new Error('No context found');
  }

  return ctx as Context;
}

export type {RouteDefinition} from '@kosmic/router';
