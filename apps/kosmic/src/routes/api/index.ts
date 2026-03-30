import type {Middleware} from '@kosmic/server';
import {authenticateBearer} from '#utils/auth.js';

export const use: Middleware = async (ctx, next) => {
  await authenticateBearer(ctx, next);
};
