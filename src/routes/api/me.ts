import type {Middleware} from 'koa';

export const get: Middleware = async (ctx, next) => {
  ctx.body = {
    message: 'API is working',
  };
};
