import type {Context, Next} from '@kosmic/server';

export async function get(ctx: Context, next: Next) {
  ctx.log.debug('logging out');
  await ctx.logout();
  ctx.redirect('/');
}
