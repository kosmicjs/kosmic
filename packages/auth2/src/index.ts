import process from 'node:process';
import type {Context, Next} from 'koa';
import session from 'koa-session';
import type passport from 'koa-passport';
import type {AbstractSessionStore} from './abstract-session-store.ts';
import type {AbstractStorageAdapter} from './abstract-storage-adapter.ts';
import {createPassport} from './passport.ts';

export {PostgresSessionStore} from './postgres-session-store.ts';
export {PostgresStorageAdapter} from './postgres-storage-adapter.ts';

export class KosmicAuth {
  storage: AbstractStorageAdapter;
  sessionStore: AbstractSessionStore;
  passport: typeof passport;

  constructor(
    storage: AbstractStorageAdapter,
    sessionStore: AbstractSessionStore,
  ) {
    this.storage = storage;
    this.sessionStore = sessionStore;
    this.passport = createPassport(this.storage);
  }

  async authenticateLocal(ctx: Context, next: Next): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.passport.authenticate('local')(ctx, next);
  }

  async authenticateBearer(ctx: Context, next: Next): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.passport.authenticate('bearer', {
      session: false,
    })(ctx, next);
  }

  authMiddleware(ctx: Context, next: Next) {
    const {passport, sessionStore} = this;

    const koa = ctx.response.app;

    koa.on('session:missed', (...ev) => {
      ctx.log.warn({...ev}, 'session:missed');
    });

    koa.on('session:invalid', (...ev) => {
      ctx.log.warn({...ev}, 'session:invalid');
    });

    koa.on('session:expired', (...ev) => {
      ctx.log.warn({...ev}, 'session:expired');
    });

    koa.use(
      session(
        {
          secure: process.env.KOSMIC_ENV === 'production',
          sameSite: 'lax',
          store: sessionStore,
        },
        koa,
      ),
    );
    koa.use(passport.initialize({userProperty: 'email'}));
    koa.use(passport.session());
  }
}
