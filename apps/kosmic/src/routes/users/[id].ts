import type {Middleware, Context, Next} from '@kosmic/server';
import * as User from '@kosmic/auth/models';
import {db} from '#db/index.js';

export const use: Middleware[] = [
  async (ctx, next) => {
    if (!ctx.isAuthenticated()) {
      ctx.status = 401;
      throw new Error('Must be authenticated to view this information');
    }

    await next();
  },
];

export const put = async (ctx: Context, next: Next) => {
  if (!ctx.params?.id) {
    throw new Error('id is required');
  }

  const userId = User.userSchema.shape.id.safeParse(ctx.params.id);
  if (!userId.success) {
    ctx.throw(400, 'invalid user id');
  }

  ctx.log.debug(ctx.request.body, 'updating user');

  const userData = await User.updateSchema.parseAsync(ctx.request.body);

  const user = await db
    .updateTable('users')
    .set(userData)
    .where('id', '=', userId.data)
    .returning(['id', 'first_name', 'last_name', 'phone', 'email'])
    .executeTakeFirstOrThrow();

  ctx.req.log.info(user, 'updated user');

  ctx.status = 303;

  ctx.redirect('/account');
};
