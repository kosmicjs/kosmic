import {type UUID, randomUUID} from 'node:crypto';
import {pinoHttp, type Options} from 'pino-http';
import type {DestinationStream, Logger} from 'pino';
import type {Middleware} from 'koa';

declare module 'koa' {
  interface DefaultContext {
    log: Logger;
  }

  interface Request {
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

const XRID_HEADER = 'x-request-id';

export type PinoHttpOptions = Options;

export type CreatePinoMiddlewareConfig = {
  /**
   * Environment mode - determines ID generation strategy
   * - 'production': Uses UUIDs for request IDs
   * - 'development' | 'test': Uses sequential numeric IDs with zero-padding
   */
  environment?: 'production' | 'development' | 'test';
};

export function createPinoMiddleware(
  options: Options,
  config?: CreatePinoMiddlewareConfig,
  stream?: DestinationStream,
): Middleware {
  let id: UUID | string | number = 0;
  options.genReqId ??= function (request, response) {
    const existingId = request.id ?? request.headers[XRID_HEADER];
    if (existingId) return existingId;

    if (config?.environment === 'production') {
      id = randomUUID();
    } else {
      id = Number(id);

      id++;

      if (id < 10) {
        id = `0${id}`;
      }
    }

    response.setHeader(XRID_HEADER, id);
    return id;
  };

  const middleware = pinoHttp(...arguments); // eslint-disable-line prefer-rest-params

  return async function (ctx, next) {
    middleware(ctx.req, ctx.res);
    // eslint-disable-next-line no-multi-assign
    ctx.log = ctx.request.log = ctx.response.log = ctx.req.log;
    await next();
  };
}
