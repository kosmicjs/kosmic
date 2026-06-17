import type {Context, Next} from '@kosmic/server';

/**
 * End the user session and return to home.
 */
export async function get(ctx: Context, next: Next) {
  await ctx.logout();
  ctx.redirect('/');
}
