import {type Middleware} from 'koa';
import {db} from '#db/index.js';
import * as Entity from '#models/entites.js';
import Layout from '#components/layout.js';
import {ModalButton} from '#components/modal-button.js';

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
            <h2>Entities</h2>
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
            <div class="col-12 p-5" id={`entity${entity.id}`}>
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">{entity.name}</h5>
                  <p class="card-text">{entity.name}</p>
                  <div class="d-flex justify-content-between">
                    <button
                      type="button"
                      hx-get={`/admin/entities/${entity.id}`}
                      hx-target={`#entity${entity.id}`}
                      hx-swap="append"
                      class="btn btn-outline-primary"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      hx-delete={`/admin/entities/${entity.id}`}
                      hx-target={`#entity${entity.id}`}
                      hx-swap="delete"
                      class="btn btn-outline-danger"
                    >
                      x
                    </button>
                  </div>
                </div>
              </div>
            </div>
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

  const {name, description} = await Entity.validateInsertableEntity(
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
    <div class="col-12 p-5" id={`entity${entity.id}`}>
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">{entity.name}</h5>
          <p class="card-text">{entity.description}</p>
          <div class="d-flex justify-content-between">
            <button
              type="button"
              hx-post={`/admin/entities/${entity.id}`}
              hx-target="#entity-list"
              hx-swap="append"
              class="btn btn-outline-primary"
            >
              Edit
            </button>
            <button
              type="button"
              hx-delete={`/admin/entities/${entity.id}`}
              hx-target={`#entity${entity.id}`}
              hx-swap="delete"
              class="btn btn-outline-danger"
            >
              x
            </button>
          </div>
        </div>
      </div>
    </div>,
  );
};
