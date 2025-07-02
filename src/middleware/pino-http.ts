import {type UUID, randomUUID} from 'node:crypto';
import {pinoHttp, type Options} from 'pino-http';
import {type DestinationStream} from 'pino';
import {type Middleware} from 'koa';
import {config} from '#config/index.js';

const XRID_HEADER = 'x-request-id';

export function createPinoMiddleware(
  options: Options,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  stream?: DestinationStream,
): Middleware {
  let id: UUID | string | number = 0;
  options.genReqId ??= function (request, response) {
    const existingId = request.id ?? request.headers[XRID_HEADER];
    if (existingId) return existingId;

    if (config.nodeEnv === 'production') {
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
