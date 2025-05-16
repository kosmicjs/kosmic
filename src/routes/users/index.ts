import type {Context, Next} from 'koa';
import {db} from '#db/index.js';
import {validateInsertableUser} from '#models/users.js';

export async function post(ctx: Context, next: Next) {
  const user = await validateInsertableUser(ctx.request.body);

  const updatedUser = await db
    .insertInto('users')
    .values(user)
    .returning('id')
    .execute();

  ctx.req.log.info({...user}, 'req.body');

  ctx.body = updatedUser;
}
