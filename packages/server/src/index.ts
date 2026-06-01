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
export type KosmicServerOptions<Database extends AuthDatabase = AuthDatabase> =
  {
    /** Database connection used for built-in auth/session integration. */
    db: Kysely<Database>;
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
export class KosmicServer<Database extends AuthDatabase = AuthDatabase> {
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

    // @eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return ctx as Context;
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
  options: KosmicServerOptions<Database>;
  server: Server | undefined;
  #passport: Passport | undefined;

  constructor(options: KosmicServerOptions<Database>) {
    this.koa = new Koa({asyncLocalStorage: true});
    this.options = options;
    // @eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    KosmicServer.#instance = this as unknown as KosmicServer;
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
        // @eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        const manifest = JSON.parse(
          await fs.readFile(manifestPath, 'utf8'),
        ) as Manifest;
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
      // `@kosmic/auth` requires the auth table subset; apps can still pass extended DBs.
      // @eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
      const authDb = this.options.db as unknown as Kysely<AuthDatabase>;
      const passport = authModule.createPassport<Kysely<AuthDatabase>>({
        db: authDb,
      });
      const sessionStore = new authModule.KyselySessionStore<
        Kysely<AuthDatabase>
      >(authDb);

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
