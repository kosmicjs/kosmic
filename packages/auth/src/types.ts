import type {SelectableUser} from './models/users.ts';

declare module 'koa' {
  interface DefaultState {
    user?: SelectableUser;
  }
}
