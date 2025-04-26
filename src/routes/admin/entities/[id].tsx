import {type Context, type Next} from 'koa';
import {db} from '../../../db/index.js';
import {validateUpdatedableEntity} from '#models/entites.js';
import {EntityCard} from '#components/entities/entity-card.js';
import {EntityEdit} from '#components/entities/entity-edit.js';

export const del = async (ctx: Context, next: Next) => {
  if (!ctx.params?.id) throw new Error('id is required');

  ctx.log.debug(
    {...(ctx.params as Record<string, unknown>)},
    'deleting entity...',
  );

  await db
    .deleteFrom('entities')
    .where('id', '=', Number.parseInt(ctx.params.id, 10))
    .execute();

  ctx.req.log.info({id: ctx.params.id}, 'deleted entity');

  ctx.status = 200;
  ctx.body = 'ok';
};

export const get = async (ctx: Context, next: Next) => {
  if (!ctx.params?.id) throw new Error('id is required');

  const entity = await db
    .selectFrom('entities')
    .where('id', '=', Number.parseInt(ctx.params.id, 10))
    .selectAll()
    .executeTakeFirstOrThrow();

  ctx.log.debug({entity}, 'fetched entity');

  ctx.status = 200;
  await ctx.render(<EntityEdit entity={entity} />);
};

export const put = async (ctx: Context, next: Next) => {
  if (!ctx.params?.id) throw new Error('id is required');

  const {name, description} = await validateUpdatedableEntity(ctx.request.body);

  ctx.log.debug(
    {...ctx.params, body: {name, description}},
    'updating entity...',
  );

  const entity = await db
    .updateTable('entities')
    .set({
      name,
      description,
    })
    .where('id', '=', Number.parseInt(ctx.params.id, 10))
    .returningAll()
    .executeTakeFirstOrThrow();

  ctx.req.log.info({entity}, 'updated entity');

  await ctx.render(<EntityCard entity={entity} />);
};
