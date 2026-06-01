import {type Middleware, getPassport} from '@kosmic/server';

const passport = getPassport();

export const use: Middleware = async (ctx, next) => {
  await passport.authenticate('bearer', {
    session: false,
  })(ctx, next);
};
