import type {Logger} from '@kosmic/logger';
import type {Middleware} from 'koa';

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

/** Duck-typed Passport instance for session-based auth. */
export type PassportLike = {
  initialize: (options?: {userProperty: string}) => Middleware;
  session: () => Middleware;
};

export type RouterLoadedRoute = {
  method: string;
  path: string;
};

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
