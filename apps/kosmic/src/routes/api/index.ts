import type {Middleware} from '@kosmic/server';
import {auth} from '#auth';

export const use: Middleware = async (ctx, next) => {
  await auth.authenticateBearer(ctx, next);
};
