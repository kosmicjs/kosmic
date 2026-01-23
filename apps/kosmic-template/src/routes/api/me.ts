import type {Middleware} from 'koa';

export const get: Middleware = async (ctx, next) => {
  ctx.body = ctx.state.user;
};
