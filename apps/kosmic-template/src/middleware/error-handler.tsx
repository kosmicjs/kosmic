import type {Middleware, Next, Context} from 'koa';
import z from 'zod/v4';
import logger from '#utils/logger.js';

export function errorHandler(): Middleware {
  async function middleware(ctx: Context, next: Next) {
    try {
      await next();
    } catch (error: unknown) {
      logger.error(error);
      ctx.status = ctx.status.toString().startsWith('4') ? ctx.status : 500;
      ctx.set('HX-Reswap', 'innerHTML');
      ctx.set('HX-Retarget', '#error-display-swap-el');
      if (error instanceof z.ZodError) {
        ctx.status = 400;
        await ctx.render(
          <div class="toast-body bg-dark">
            {z.prettifyError(error).replaceAll(String.raw`\"`, '"')}
          </div>,
        );
      } else if (error instanceof Error) {
        await ctx.render(
          <div class="toast-body bg-dark">
            {error.toString().replaceAll(String.raw`\"`, '"')}
          </div>,
        );
      }
    }
  }

  return middleware;
}
