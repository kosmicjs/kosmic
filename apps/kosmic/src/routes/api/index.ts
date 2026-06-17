import type {Middleware} from '@kosmic/server/v2';
import {auth} from '#auth';

export const use: Middleware = async (ctx, next) => {
  await auth.authenticateBearer(ctx, next);
};
