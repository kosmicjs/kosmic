import type {Context, Next, Middleware} from 'koa';
import {db} from '../../db/index.js';
import {validateInsertableUser} from '#models/users.js';

export async function get(ctx: Context, next: Next) {
  const users = await db
    .selectFrom('users')
    .select(['id', 'first_name', 'last_name', 'email'])
    .execute();

  ctx.req.log.info(users, 'users');

  ctx.body = users;
}

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

export async function useGet(ctx: Context, next: Next) {
  await next();
}

export const use: {get?: Middleware} = {get: useGet};
