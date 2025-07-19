import type {Middleware} from 'koa';

export const use: Middleware = async (ctx, next) => {
  ctx.set('HX-Redirect', '/login');
  await next();
};
