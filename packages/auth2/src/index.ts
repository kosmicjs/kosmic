import type passport from 'koa-passport';
import type {SelectableUser} from './models/users.ts';

/**
 * EXPORTS
 */

export * from './models/index.ts';
export {createPassport} from './passport.ts';
export {KyselySessionStore} from './session-store.ts';

declare module 'koa' {
  interface DefaultState {
    user?: SelectableUser;
  }
}
export type Passport = typeof passport;
export {default as passport} from 'koa-passport';
