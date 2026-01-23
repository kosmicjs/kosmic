import {promisify} from 'node:util';
import helmet, {type HelmetOptions} from 'helmet';
import type {Middleware} from 'koa';

export function createHelmetMiddleware(options?: HelmetOptions): Middleware {
  return async (ctx, next) => {
    const helmetPromise = promisify(helmet(options));
    await helmetPromise(ctx.req, ctx.res);
    await next();
  };
}

export {type HelmetOptions} from 'helmet';
