import type {Middleware, Next, Context} from 'koa';
import z from 'zod/v4';

/**
 * Generic render function type that accepts any component
 * This allows error-handler to work with any rendering implementation
 */
declare module 'koa' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface DefaultContext {
    render: (component: unknown) => Promise<void>;
  }

  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Response {
    render: (component: unknown) => Promise<void>;
  }
}

export type Logger = {
  error: (error: unknown) => void;
};

export type ErrorHandlerOptions = {
  /**
   * Optional logger for error reporting
   */
  logger?: Logger;
};

/**
 * Error handling middleware for Koa applications
 *
 * Requires a render middleware to be installed that augments Context with:
 * - render(component: unknown): Promise<void>
 *
 * Compatible with @kosmic/jsx or any other JSX rendering middleware
 *
 * @param options - Configuration options
 * @returns Koa middleware function
 */
export function errorHandler(options?: ErrorHandlerOptions): Middleware {
  async function middleware(ctx: Context, next: Next) {
    try {
      await next();
    } catch (error: unknown) {
      options?.logger?.error(error);
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
