import process from 'node:process';
import type {Context, Next} from 'koa';
import type Koa from 'koa';
import session from 'koa-session';
import type passport from 'koa-passport';
import {getLogger} from '@kosmic/logger';
import type {AbstractSessionStore} from './abstract-session-store.ts';
import type {AbstractDataStorage} from './abstract-storage-adapter.ts';
import {createPassport} from './passport.ts';
import type {User} from './types.ts';

export {PostgresSessionStore} from './postgres-session-store.ts';
export {PostgresStorageAdapter} from './postgres-storage-adapter.ts';
export * from './models/index.ts';

declare module 'koa' {
  interface DefaultState {
    user?: User;
  }
}

export class KosmicAuth {
  storage: AbstractDataStorage;
  sessionStore: AbstractSessionStore;

  #isInitialized = false;
  readonly #passport: typeof passport;

  constructor(
    storage: AbstractDataStorage,
    sessionStore: AbstractSessionStore,
  ) {
    this.storage = storage;
    this.sessionStore = sessionStore;
    this.#passport = createPassport(this.storage);
  }

  initialize = async (koa: Koa): Promise<void> => {
    // --- Session & Passport ---
    koa.on('session:missed', (...ev) => {
      const logger = getLogger();
      logger.warn({...ev}, 'session:missed');
    });

    koa.on('session:invalid', (...ev) => {
      const logger = getLogger();
      logger.warn({...ev}, 'session:invalid');
    });

    koa.on('session:expired', (...ev) => {
      const logger = getLogger();
      logger.warn({...ev}, 'session:expired');
    });

    koa.use(
      session(
        {
          secure: process.env.KOSMIC_ENV === 'production',
          sameSite: 'lax',
          store: this.sessionStore,
        },
        koa,
      ),
    );

    koa.use(this.#passport.initialize({userProperty: 'email'}));

    koa.use(this.#passport.session());

    this.#isInitialized = true;
  };

  authenticateLocal = async (ctx: Context, next: Next): Promise<void> => {
    if (!this.#isInitialized) {
      throw new Error('KosmicAuth must be initialized before use');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.#passport.authenticate('local')(ctx, next);
  };

  authenticateBearer = async (ctx: Context, next: Next): Promise<void> => {
    if (!this.#isInitialized) {
      throw new Error('KosmicAuth must be initialized before use');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.#passport.authenticate('bearer', {
      session: false,
    })(ctx, next);
  };
}
