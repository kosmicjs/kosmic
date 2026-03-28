import type {Middleware} from '@kosmic/server';
import {authenticateBearer} from '#middleware/auth.js';

export const use: Middleware = async (ctx, next) => {
  await authenticateBearer(ctx, next);
};
