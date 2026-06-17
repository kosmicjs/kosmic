import type {Middleware} from '@kosmic/server/v2';
import {z} from 'zod';
import {generateApiKey} from '@kosmic/auth';
import {db} from '#db/index.js';

export const post: Middleware = async (ctx, next) => {
  if (!ctx.state.user?.id) {
    ctx.status = 401;
    ctx.body = {error: 'Unauthorized'};
    return;
  }

  const body = z.object({name: z.string().optional()}).parse(ctx.request.body);

  const keyName = body.name?.trim();

  try {
    const {apiKey, keyPrefix, keyHash} = await generateApiKey();

    // Insert the API key into the database
    await db
      .insertInto('api_keys')
      .values({
        user_id: ctx.state.user.id,
        name: keyName ?? 'Unnamed',
        key_hash: keyHash,
        key_prefix: keyPrefix,
        is_active: true,
      })
      .executeTakeFirstOrThrow();

    ctx.status = 201;
    await ctx.render(
      <div class="alert alert-success alert-dismissible fade show" role="alert">
        <h6 class="alert-heading">API Key Created Successfully!</h6>
        <p class="mb-2">
          <strong>Key Name:</strong> {keyName ?? 'Unnamed'}
        </p>
        <div class="mb-3">
          <label class="form-label">
            <strong>
              Your API Key (copy this now - it won&apos;t be shown again):
            </strong>
          </label>
          <div class="input-group">
            <input
              readonly
              type="text"
              class="form-control font-monospace"
              value={apiKey}
              id="newApiKey"
            />
            <button class="btn btn-outline-secondary" type="button">
              Copy
            </button>
          </div>
        </div>
        <button
          type="button"
          class="btn-close"
          data-bs-dismiss="alert"
        ></button>
      </div>,
    );
  } catch (error) {
    ctx.log.error(error, 'failed to create API key');
    ctx.status = 500;
    await ctx.render(
      <div class="alert alert-danger alert-dismissible fade show" role="alert">
        <strong>Error!</strong> Failed to create API key. Please try again.
        <button
          type="button"
          class="btn-close"
          data-bs-dismiss="alert"
        ></button>
      </div>,
    );
  }
};
