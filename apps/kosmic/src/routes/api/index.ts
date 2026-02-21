import type {Middleware} from '@kosmic/server';
import {passport} from '#middleware/passport.js';

export const use: Middleware = async (ctx, next) => {
  await passport.authenticate('bearer', {session: false})(ctx, next);
};
