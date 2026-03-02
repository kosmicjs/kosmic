import process from 'node:process';
import http, {type Server, type IncomingMessage} from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import Koa, {type Context, type Middleware} from 'koa';
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
import {createFsRouter} from '@kosmic/router';
import {type Logger, logger as defaultLogger} from '@kosmic/logger';

export type {default as Koa} from 'koa';
export type {
  Context,
  Next,
  Middleware,
  Parameters_,
  DefaultContext,
  ParameterizedContext,
  DefaultStateExtends,
  BaseContext,
  DefaultState,
  Request,
  Response,
} from 'koa';
export type {stores as SessionStore, Session} from 'koa-session';
export type {RouteDefinition} from '@kosmic/router';
export type {HelmetOptions} from '@kosmic/helmet';
declare module 'koa' {
  interface DefaultState {
    manifest?: Manifest;
  }
  interface DefaultContext {
    log: Logger;
  }

  interface Request {
    body?: unknown;
    rawBody: string;
    log: Logger;
  }

  interface Response {
    log: Logger;
  }
}

declare module 'node:http' {
  interface IncomingMessage {
    log: Logger;
  }

  interface ServerResponse {
    log: Logger;
  }
}

export type Manifest = Record<
  string,
  {
    css: string[];
    file: string;
    isEntry: boolean;
    src: string;
  }
>;

/** Duck-typed Passport instance for session-based auth. */
export type PassportLike = {
  initialize: (options?: {userProperty: string}) => Middleware;
  session: () => Middleware;
};

type ContentSecurityPolicyOptions = Exclude<
  HelmetOptions['contentSecurityPolicy'],
  boolean
>;

type ContentSecurityPolicy = NonNullable<ContentSecurityPolicyOptions>;

type RouterLoadedRoute = {
  method: string;
  path: string;
};

/** Options accepted by the KosmicServer constructor. All fields are optional. */
export type KosmicServerOptions = {
  /** Pino-compatible logger instance. Defaults to a console-based logger. */
  logger?: typeof defaultLogger;
  /** Node environment. Defaults to `process.env.NODE_ENV` or `'development'`. */
  nodeEnv?: 'production' | 'development' | 'test';
  /** Kosmic-specific environment string. Defaults to `nodeEnv`. */
  kosmicEnv?: string;
  /** Keys used for cookie signing / session encryption. Defaults to `['kosmic-dev-key']`. */
  sessionKeys?: string[];
  /** Absolute path to the file-system routes directory. Defaults to `<cwd>/src/routes`. */
  routesDir?: string;
  /** Absolute path to the public / static assets directory. Defaults to `<cwd>/src/public`. */
  publicDir?: string;
  /** Override the default Vite manifest path (`<publicDir>/.vite/manifest.json`). */
  manifestPath?: string;
  /** Session store implementation (e.g. a database-backed store). */
  sessionStore?: SessionStore;
  /** Passport instance for authentication. */
  passport?: PassportLike;
  /** Helmet options — merged with sensible defaults for CSP. */
  helmetOptions?: HelmetOptions;
  /** Extra session options (the `store` field is set automatically). */
  sessionOptions?: Omit<session.opts, 'store'>;
};

/**
 * Opinionated, Koa server for Kosmic apps.
 *
 * @example
 * ```ts
 * const server = new KosmicServer({ logger, nodeEnv: 'production', ... });
 * await server.listen(3000);
 * ```
 */
export class KosmicServer {
  /**
   * Retrieve the current Koa `Context` via async-local-storage.
   *
   * @throws When called outside of a request lifecycle.
   */
  static getCtx(): Context {
    if (!KosmicServer.#instance) {
      throw new Error('No KosmicServer instance has been created');
    }

    const ctx = KosmicServer.#instance.#koa.currentContext;

    if (!ctx) {
      throw new Error('No context found');
    }

    return ctx as Context;
  }

  /** The most recently constructed KosmicServer — used by `getCtx()`. */
  static #instance: KosmicServer | undefined;

  readonly #koa: Koa;
  readonly #options: KosmicServerOptions;
  #server: Server | undefined;

  constructor(options: KosmicServerOptions) {
    this.#koa = new Koa({asyncLocalStorage: true});
    this.#options = options;
    KosmicServer.#instance = this;
  }

  /** The underlying Koa application. */
  get app(): Koa {
    return this.#koa;
  }

  /**
   * The underlying `http.Server`, available after `.listen()` resolves.
   */
  get server(): Server | undefined {
    return this.#server;
  }

  /**
   * Bootstrap middleware, load file-system routes, and start listening.
   *
   * @returns The raw `http.Server` for lifecycle management.
   */
  async listen(port: number, host = '0.0.0.0'): Promise<Server> {
    await this.#bootstrap();

    // @ts-expect-error Koa typings don't allow for generic request/response types, but the underlying `http.Server` is compatible with the standard types.
    const server = http.createServer<Koa.Request['req'], Koa.Response>(
      this.#koa.callback(),
    );
    this.#server = server;

    await new Promise<void>((resolve) => {
      server.listen(port, host, () => {
        resolve();
      });
    });

    return server;
  }

  /**
   * Merge user-provided helmet options with sane CSP defaults.
   */
  #mergeHelmetOptions(
    kosmicEnv: string,
    helmetOptions?: HelmetOptions,
  ): HelmetOptions {
    const defaultDirectives = {
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

  /**
   * Wire up the full middleware pipeline and file-system router.
   */
  async #bootstrap(): Promise<void> {
    const nodeEnv =
      this.#options.nodeEnv ??
      (process.env.NODE_ENV as KosmicServerOptions['nodeEnv']) ??
      'development';
    const logger = this.#options.logger ?? defaultLogger;
    const kosmicEnv = this.#options.kosmicEnv ?? nodeEnv;
    const sessionKeys = this.#options.sessionKeys ?? ['kosmic-dev-key'];
    const routesDir =
      this.#options.routesDir ?? path.join(process.cwd(), 'src', 'routes');
    const publicDir =
      this.#options.publicDir ?? path.join(process.cwd(), 'src', 'public');
    const manifestPath =
      this.#options.manifestPath ??
      path.join(publicDir, '.vite', 'manifest.json');
    const {sessionStore, passport, helmetOptions, sessionOptions} =
      this.#options;

    const koa = this.#koa;

    koa.use(responseTime());
    koa.use(serve(publicDir));

    if (kosmicEnv === 'production') {
      koa.use(async (ctx, next) => {
        const manifest = JSON.parse(
          await fs.readFile(manifestPath, 'utf8'),
        ) as Manifest;
        ctx.state.manifest = manifest;
        await next();
      });
    }

    koa.use(
      createPinoMiddleware(
        {logger} as Parameters<typeof createPinoMiddleware>[0],
        {environment: nodeEnv},
      ),
    );

    koa.use(conditional());
    koa.use(etag());
    koa.use(bodyParser());
    koa.use(renderMiddleware);
    koa.use(errorHandler({logger}));

    // --- Session & Passport ---
    koa.keys = sessionKeys;
    koa.proxy = kosmicEnv === 'production';

    if (sessionStore) {
      koa.on('session:missed', (...ev) => {
        logger.warn({...ev}, 'session:missed');
      });

      koa.on('session:invalid', (...ev) => {
        logger.warn({...ev}, 'session:invalid');
      });

      koa.on('session:expired', (...ev) => {
        logger.warn({...ev}, 'session:expired');
      });

      koa.use(
        session(
          {
            secure: kosmicEnv === 'production',
            sameSite: 'lax',
            ...sessionOptions,
            store: sessionStore,
          },
          koa,
        ),
      );
    }

    if (passport) {
      koa.use(passport.initialize({userProperty: 'email'}));
      koa.use(passport.session());
    }

    koa.on('router:loaded', (ev: {routes: RouterLoadedRoute[]}) => {
      console.log('Router loaded with routes:');
      logger.debug({routes: ev.routes}, 'router:loaded');
    });

    // --- File-system router ---
    const {middleware: fsRouterMiddleware} = await createFsRouter(
      routesDir,
      koa,
    );
    koa.use(fsRouterMiddleware);

    // --- Helmet (last) ---
    koa.use(
      createHelmetMiddleware(
        this.#mergeHelmetOptions(kosmicEnv, helmetOptions),
      ),
    );
  }
}

/**
 * Convenience wrapper around `KosmicServer.getCtx()`.
 *
 * Retrieves the current Koa `Context` via async-local-storage.
 */
export function getCtx(): Context {
  return KosmicServer.getCtx();
}
