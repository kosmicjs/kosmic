import type {Middleware} from '@kosmic/server';

export const get: Middleware = async (ctx, next) => {
  ctx.redirect('/docs/installation');
};
