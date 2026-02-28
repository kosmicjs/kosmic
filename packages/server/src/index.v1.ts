import process from 'node:process';
import http, {type Server} from 'node:http';
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

export type {default as Koa} from 'koa';
export type {Context, Next, Middleware} from 'koa';
export type {stores as SessionStore, Session} from 'koa-session';
export type {RouteDefinition} from '@kosmic/router';
export type {HelmetOptions} from '@kosmic/helmet';

export type Manifest = Record<
  string,
  {
    css: string[];
    file: string;
    isEntry: boolean;
    src: string;
  }
>;

/** Minimal logger interface required by KosmicServer. */
export type LoggerLike = {
  debug: (object: unknown, message?: string) => void;
  warn: (object: unknown, message?: string) => void;
  error: (error: unknown) => void;
};

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

type ContentSecurityPolicyDirectives = NonNullable<
  ContentSecurityPolicy['directives']
>;

type RouterLoadedRoute = {
  method: string;
  path: string;
};

/** Console-based fallback logger used when none is provided. */
const defaultLogger: LoggerLike = {
  debug(object: unknown, message?: string) {
    console.debug(message ?? '', object);
  },
  warn(object: unknown, message?: string) {
    console.warn(message ?? '', object);
  },
  error(error: unknown) {
    console.error(error);
  },
};

/** Options accepted by the KosmicServer constructor. All fields are optional. */
export type KosmicServerOptions = {
  /** Pino-compatible logger instance. Defaults to a console-based logger. */
  logger?: LoggerLike;
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

declare module 'koa' {
  interface Request {
    body?: unknown;
    rawBody: string;
  }

  interface DefaultState {
    manifest?: Manifest;
  }
}

/**
 * Opinionated, class-based Koa server for Kosmic apps.
 *
 * @example
 * ```ts
 * const server = new KosmicServer({ logger, nodeEnv: 'production', ... });
 * await server.listen(3000);
 * ```
 */
export class KosmicServer {
  // --- Public static methods ---

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

  // --- Static fields ---

  /** The most recently constructed KosmicServer — used by `getCtx()`. */
  static #instance: KosmicServer | undefined;

  // --- Private static methods ---

  /** Build default CSP directives for development environments. */
  static #createDefaultHelmetDirectives(
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

  /** Merge user-provided helmet options with sane CSP defaults. */
  static #mergeHelmetOptions(
    kosmicEnv: string,
    helmetOptions?: HelmetOptions,
  ): HelmetOptions {
    const defaultDirectives =
      KosmicServer.#createDefaultHelmetDirectives(kosmicEnv);

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

  /** Attach listeners for session and router events. */
  static #attachEventLogging(koa: Koa, logger: LoggerLike): void {
    koa.on('session:missed', (...ev) => {
      logger.warn({...ev}, 'session:missed');
    });

    koa.on('session:invalid', (...ev) => {
      logger.warn({...ev}, 'session:invalid');
    });

    koa.on('session:expired', (...ev) => {
      logger.warn({...ev}, 'session:expired');
    });

    koa.on('router:loaded', (ev: {routes: RouterLoadedRoute[]}) => {
      logger.debug({routes: ev.routes}, 'router:loaded');
    });
  }

  // --- Instance fields ---

  readonly #koa: Koa;
  readonly #options: KosmicServerOptions;
  #server: Server | undefined;

  // --- Constructor ---

  constructor(options: KosmicServerOptions) {
    this.#koa = new Koa({asyncLocalStorage: true});
    this.#options = options;
    KosmicServer.#instance = this;
  }

  // --- Instance accessors ---

  /** The underlying Koa application. */
  get app(): Koa {
    return this.#koa;
  }

  /** The underlying `http.Server`, available after `.listen()` resolves. */
  get server(): Server | undefined {
    return this.#server;
  }

  // --- Instance methods ---

  /**
   * Bootstrap middleware, load file-system routes, and start listening.
   *
   * @returns The raw `http.Server` for lifecycle management.
   */
  async listen(port: number, host = '0.0.0.0'): Promise<Server> {
    await this.#bootstrap();

    const server = http.createServer(this.#koa.callback());
    this.#server = server;

    await new Promise<void>((resolve) => {
      server.listen(port, host, () => {
        resolve();
      });
    });

    return server;
  }

  // --- Private instance methods ---

  /** Wire up the full middleware pipeline and file-system router. */
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

    // --- Core middleware ---
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

    // --- File-system router ---
    const {middleware: fsRouterMiddleware} = await createFsRouter(
      routesDir,
      koa,
    );
    koa.use(fsRouterMiddleware);

    // --- Helmet (last) ---
    koa.use(
      createHelmetMiddleware(
        KosmicServer.#mergeHelmetOptions(kosmicEnv, helmetOptions),
      ),
    );

    // --- Event logging ---
    KosmicServer.#attachEventLogging(koa, logger);
  }
}
