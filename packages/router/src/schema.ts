import {z} from 'zod/v4';
import type {Middleware as KoaMiddleware} from 'koa';
import type {MatchFunction} from 'path-to-regexp';

export const middlewareSchema = z
  .custom<(...args: unknown[]) => unknown>(
    (value) => typeof value === 'function',
    {
      message: 'Middleware must be a function',
    },
  )
  .optional() as unknown as z.ZodType<KoaMiddleware, KoaMiddleware>;

export type Middleware = z.infer<typeof middlewareSchema>;

export const middlewareArraySchema = z
  .union([z.array(middlewareSchema).optional(), middlewareSchema.optional()])
  .optional();

export const useObjectSchema = z.object({
  get: middlewareArraySchema.optional(),
  post: middlewareArraySchema.optional(),
  put: middlewareArraySchema.optional(),
  patch: middlewareArraySchema.optional(),
  delete: middlewareArraySchema.optional(),
  all: middlewareArraySchema.optional(),
});

export type UseObject = z.infer<typeof useObjectSchema>;

export const useSchema = z.union([
  useObjectSchema,
  z.array(useObjectSchema),
  middlewareSchema,
  z.array(middlewareSchema),
]);

export type Use = z.infer<typeof useSchema>;

export const routeModuleSchema = z.object({
  get: middlewareSchema.optional(),
  post: middlewareSchema.optional(),
  put: middlewareSchema.optional(),
  patch: middlewareSchema.optional(),
  delete: middlewareSchema.optional(),
  del: middlewareSchema.optional(),
  use: useSchema.optional(),
});

export type HttpVerb = 'get' | 'post' | 'put' | 'patch' | 'delete';

export type HttpVerbsAll = HttpVerb | 'all';

export type RouteModule = z.infer<typeof routeModuleSchema>;

export type RouteDefinition = {
  /**
   * The path of the route expressed as a path-to-regexp string
   */
  uriPath: string;
  /**
   * The path to the file on disk
   */
  filePath: string;
  /**
   * The path-to-regexp match function which can be used to extract params from a url
   *
   * @example
   * ```ts
   * const isMatch = route.match('/users/:id');
   * ```
   */
  match: MatchFunction<Record<string, string | undefined>>;
  /**
   * The raw module exported from the file
   * (schema validated by zod)
   */
  module: RouteModule;
  /**
   * The params extracted from the url to be passed into the route handler
   */
  params?: Record<string, string | undefined>;

  /**
   * The middleware to be executed before the route handler, already bundled into composed handlers, but exposed on the route definition for debugging purposes
   */

  collectedMiddleware?: Record<HttpVerbsAll, Middleware[]>;
} & Partial<Record<HttpVerb, Middleware>>;

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class RouteClass implements RouteModule {}
