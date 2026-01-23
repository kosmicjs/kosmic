import {z} from 'zod/v4';

export const middlewareSchema = z
  .custom<(...args: unknown[]) => unknown>((val) => typeof val === 'function', {
    message: 'Middleware must be a function',
  })
  .optional();

export const middlewareArraySchema = z
  .union([z.array(middlewareSchema).optional(), middlewareSchema.optional()])
  .optional();

export const useObjectSchema = z.object({
  get: middlewareArraySchema,
  post: middlewareArraySchema,
  put: middlewareArraySchema,
  patch: middlewareArraySchema,
  delete: middlewareArraySchema,
  all: middlewareArraySchema,
});

export const useSchema = z.union([
  useObjectSchema,
  z.array(useObjectSchema),
  middlewareSchema,
  z.array(middlewareSchema),
]);

export const routeModuleSchema = z.object({
  get: middlewareSchema,
  post: middlewareSchema,
  put: middlewareSchema,
  patch: middlewareSchema,
  delete: middlewareSchema,
  use: useSchema,
});
