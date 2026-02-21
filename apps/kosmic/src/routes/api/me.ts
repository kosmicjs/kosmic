import type {Middleware} from '@kosmic/server';

export const get: Middleware = async (ctx, next) => {
  ctx.body = ctx.state.user;
};
