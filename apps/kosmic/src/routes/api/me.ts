import type {Middleware} from '@kosmic/server/v2';

export const get: Middleware = async (ctx, next) => {
  ctx.body = ctx.state.user;
};
