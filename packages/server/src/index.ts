import process from 'node:process';
import type {Server} from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import Koa, {type Context} from 'koa';
import bodyParser from 'koa-bodyparser';
import type {Passport, AuthDatabase} from '@kosmic/auth';
import conditional from 'koa-conditional-get';
import responseTime from 'koa-response-time';
import session, {type stores as SessionStore} from 'koa-session';
import serve from 'koa-static';
import etag from '@koa/etag';
import {config} from '@kosmic/config';
import type {Kysely} from '@kosmic/db';
import {errorHandler} from '@kosmic/error-handler';
import {createHelmetMiddleware, type HelmetOptions} from '@kosmic/helmet';
import {renderMiddleware} from '@kosmic/jsx';
import {createFsRouter} from '@kosmic/router';
import {
  createPinoMiddleware,
  type Logger,
  logger as defaultLogger,
} from '@kosmic/logger';

export * from '@kosmic/auth';
export type {stores as SessionStore, Session} from 'koa-session';
export type {RouteDefinition} from '@kosmic/router';
export type {HelmetOptions} from '@kosmic/helmet';
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
  default as Koa,
} from 'koa';

export type Manifest = Record<
  string,
  {
    css: string[];
    file: string;
    isEntry: boolean;
    src: string;
  }
>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === 'string')
  );
}

function parseManifest(value: unknown): Manifest {
  if (!isRecord(value)) {
    throw new TypeError('Invalid Vite manifest: expected an object');
  }

  const manifest: Manifest = {};

  for (const key of Object.keys(value)) {
    const entry = value[key];

    if (!isRecord(entry)) {
      throw new TypeError(`Invalid Vite manifest entry for "${key}"`);
    }

    const {css, file, isEntry, src} = entry;

    if (
      !isStringArray(css) ||
      typeof file !== 'string' ||
      typeof isEntry !== 'boolean' ||
      typeof src !== 'string'
    ) {
      throw new TypeError(`Invalid Vite manifest shape for "${key}"`);
    }

    manifest[key] = {css, file, isEntry, src};
  }

  return manifest;
}

function isKoaContext(value: unknown): value is Context {
  if (!isRecord(value)) {
    return false;
  }

  return 'app' in value && 'request' in value && 'response' in value;
}

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

/** Options accepted by the KosmicServer constructor. All fields are optional. */
export type KosmicServerOptions = {
  /** Database connection used for built-in auth/session integration. */
  db: Kysely<AuthDatabase>;
  /** Enables built-in auth/session setup with a dynamic `@kosmic/auth` import. */
  auth?: boolean;
  /** Pino-compatible logger instance. Defaults to a console-based logger. */
  logger?: Logger;
  /** Keys used for cookie signing / session encryption. Defaults to `config.sessionKeys`. */
  sessionKeys?: string[];
  /** Absolute path to the file-system routes directory. Defaults to `<cwd>/src/routes`. */
  routesDir?: string;
  /** Absolute path to the public / static assets directory. Defaults to `<cwd>/src/public`. */
  publicDir?: string;
  /** Override the default Vite manifest path (`<publicDir>/.vite/manifest.json`). */
  manifestPath?: string;
  /** Helmet options — merged with sensible defaults for CSP. */
  helmetOptions?: HelmetOptions;
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

    const ctx = KosmicServer.#instance.koa.currentContext;

    if (!ctx) {
      throw new Error('No context found');
    }

    if (!isKoaContext(ctx)) {
      throw new Error('Current context is not a valid Koa Context');
    }

    return ctx;
  }

  /**
   * Retrieve the configured Passport instance.
   *
   * @throws When auth is disabled or server bootstrap has not initialized passport yet.
   */
  static getPassport(): Passport {
    if (!KosmicServer.#instance) {
      throw new Error('No KosmicServer instance has been created');
    }

    const passport = KosmicServer.#instance.#passport;

    if (!passport) {
      throw new Error('Auth is not enabled on this KosmicServer instance');
    }

    return passport;
  }

  /** Singleton */
  static #instance: KosmicServer | undefined;

  koa: Koa;
  options: KosmicServerOptions;
  server: Server | undefined;
  #passport: Passport | undefined;

  constructor(options: KosmicServerOptions) {
    this.koa = new Koa({asyncLocalStorage: true});
    this.options = options;
    KosmicServer.#instance = this;
  }

  /** The underlying Koa application. */
  get app(): Koa {
    return this.koa;
  }

  /**
   * Bootstrap middleware, load file-system routes, and start listening.
   *
   * @returns The raw `http.Server` for lifecycle management.
   */
  async listen(port = config.port, host = config.host): Promise<Server> {
    await this.#bootstrap();

    this.server = this.koa.listen(port, host);

    return this.server;
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

    let providedCsp;

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
    const logger = this.options.logger ?? defaultLogger;
    const sessionKeys = this.options.sessionKeys ?? config.sessionKeys;
    const routesDir =
      this.options.routesDir ?? path.join(process.cwd(), 'src', 'routes');
    const publicDir =
      this.options.publicDir ?? path.join(process.cwd(), 'src', 'public');
    const manifestPath =
      this.options.manifestPath ??
      path.join(publicDir, '.vite', 'manifest.json');
    const {auth = false, helmetOptions} = this.options;

    const {koa} = this;

    koa.use(responseTime());
    koa.use(serve(publicDir));

    if (config.kosmicEnv === 'production') {
      koa.use(async (ctx, next) => {
        const manifest = parseManifest(
          JSON.parse(await fs.readFile(manifestPath, 'utf8')),
        );
        ctx.state.manifest = manifest;
        await next();
      });
    }

    koa.use(createPinoMiddleware({logger}, {environment: config.nodeEnv}));

    koa.use(conditional());
    koa.use(etag());
    koa.use(bodyParser());
    koa.use(renderMiddleware);
    koa.use(errorHandler({logger}));

    // --- Session & Passport ---
    koa.keys = sessionKeys;
    koa.proxy = config.kosmicEnv === 'production';

    if (auth) {
      const authModule = await import('@kosmic/auth');
      const passport = authModule.createPassport({
        db: this.options.db,
      });
      const sessionStore = new authModule.KyselySessionStore(this.options.db);

      this.#passport = passport;

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
            secure: config.kosmicEnv === 'production',
            sameSite: 'lax',
            store: sessionStore,
          },
          koa,
        ),
      );
      koa.use(passport.initialize({userProperty: 'email'}));
      koa.use(passport.session());
    }

    koa.on('router:loaded', (ev: {routes: unknown[]}) => {
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
        this.#mergeHelmetOptions(config.kosmicEnv, helmetOptions),
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

/**
 * Convenience wrapper around `KosmicServer.getPassport()`.
 */
export function getPassport(): Passport {
  return KosmicServer.getPassport();
}
