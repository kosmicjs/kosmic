import type {Context, Next} from '@kosmic/server';
import * as User from '@kosmic/auth/models';
import {db} from '#db/index.js';

export async function post(ctx: Context, next: Next) {
  const user = await User.insertSchema.parseAsync(ctx.request.body);

  const updatedUser = await db
    .insertInto('users')
    .values(user)
    .returning('id')
    .execute();

  ctx.req.log.info({...user}, 'req.body');

  ctx.body = updatedUser;
}
