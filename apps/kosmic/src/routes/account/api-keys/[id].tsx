import type {Middleware} from 'koa';
import {db} from '#db/index.js';
// import * as ApiKey from '#models/api-keys.js';

export const del: Middleware = async (ctx, next) => {
  if (!ctx.state.user) {
    ctx.status = 401;
    ctx.body = {error: 'Unauthorized'};
    return;
  }

  const keyIdRaw = ctx.params?.id;
  const keyId = keyIdRaw ? Number(keyIdRaw) : undefined;
  if (!keyId || Number.isNaN(keyId)) {
    ctx.status = 400;
    ctx.body = {error: 'API key ID required'};
    return;
  }

  // Only allow deleting keys owned by the user
  const deleted = await db
    .deleteFrom('api_keys')
    .where('id', '=', keyId)
    .where('user_id', '=', ctx.state.user.id)
    .executeTakeFirst();

  if (deleted && deleted.numDeletedRows > 0) {
    ctx.status = 200;
    await ctx.render(
      <div class="alert alert-success alert-dismissible fade show" role="alert">
        <strong>API Key Revoked!</strong> The key has been deleted.
        <button
          type="button"
          class="btn-close"
          data-bs-dismiss="alert"
        ></button>
      </div>,
    );
  } else {
    ctx.status = 404;
    await ctx.render(
      <div class="alert alert-danger alert-dismissible fade show" role="alert">
        <strong>Error!</strong> API key not found or not owned by you.
        <button
          type="button"
          class="btn-close"
          data-bs-dismiss="alert"
        ></button>
      </div>,
    );
  }
};
