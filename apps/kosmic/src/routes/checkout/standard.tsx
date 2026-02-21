import type {Middleware} from '@kosmic/server';

export const get: Middleware = async function (ctx) {
  if (!ctx.state.session?.url) {
    throw new Error('No session URL');
  }

  ctx.status = 303;

  ctx.redirect(ctx.state.session.url);
};
