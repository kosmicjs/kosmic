import type {Middleware} from 'koa';
import {db} from '#db/index.js';
import * as Entity from '#models/entities.js';
import Layout from '#components/layout.js';
import {ModalButton} from '#components/modal-button.js';
import {EntityCard} from '#components/entities/entity-card.js';

export const get: Middleware = async (ctx, next) => {
  if (!ctx.state.user) {
    throw new Error('Not logged in');
  }

  const entities = await db
    .selectFrom('entities')
    .selectAll()
    .where('entities.user_id', '=', ctx.state.user.id)
    .execute();

  ctx.log.debug({entities});

  await ctx.render(
    <Layout>
      <div class="row">
        <div class="col-12 p-5">
          <div className="d-flex justify-content-center">
            <h2>{ctx.state.user?.first_name}&apos;s Entities</h2>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-12 p-5">
          <ModalButton name="add-entity">Add</ModalButton>
        </div>
      </div>
      <div id="entity-list" class="w-100">
        {entities.map((entity) => (
          <div class="row">
            <EntityCard entity={entity} />
          </div>
        ))}
      </div>
    </Layout>,
  );
};

export const post: Middleware = async (ctx, next) => {
  if (!ctx.state.user) {
    throw new Error('Not logged in');
  }

  const {name, description} = await Entity.insertSchema.parseAsync(
    ctx.request.body,
  );

  const entity = await db
    .insertInto('entities')
    .values({name, description, user_id: ctx.state.user.id})
    .returningAll()
    .executeTakeFirst();

  if (!entity) {
    throw new Error('Failed to create entity');
  }

  ctx.status = 201;
  await ctx.render(
    <div class="row">
      <EntityCard entity={entity} />
    </div>,
  );
};
