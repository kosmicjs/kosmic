import process from 'node:process';
import type {Context} from '@kosmic/server/v2';
import session from 'koa-session';
import type {AbstractSessionStore} from './abstract-session-store.ts';
import type {AbstractStorageAdapter} from './abstract-storage-adapter.ts';
import {createPassport} from './passport.ts';

export class KosmicAuth {
  storage: AbstractStorageAdapter;
  sessionStore: AbstractSessionStore;

  constructor(
    storage: AbstractStorageAdapter,
    sessionStore: AbstractSessionStore,
  ) {
    this.storage = storage;
    this.sessionStore = sessionStore;
  }

  authMiddleware(ctx: Context) {
    const passport = createPassport(this.storage);

    const {sessionStore} = this;

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
