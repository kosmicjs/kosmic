import type {Context, Next} from 'koa';

export async function get(ctx: Context, next: Next) {
  ctx.log.debug('logging out');
  await ctx.logout();
  ctx.redirect('/');
}
