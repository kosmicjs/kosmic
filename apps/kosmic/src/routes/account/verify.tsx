import type {Middleware} from '@kosmic/server';
import Layout from '#components/layout.js';
import {db} from '#db/index.js';

export const get: Middleware = async (ctx, next) => {
  if (!ctx.state.user) {
    throw new Error('Unauthorized');
  }

  ctx.log.debug({user: ctx.state.user}, 'verifying user...');

  if (
    !ctx.state.user.is_verified &&
    ctx.state.user.verification_token !== ctx.query.token
  ) {
    ctx.log.error('Invalid verification token');
    ctx.redirect('/signup?error=invalid-token');
    return;
  }

  await db
    .updateTable('users')
    .set({
      is_verified: true,
    })
    .where('id', '=', ctx.state.user.id)
    .execute();

  await ctx.render(
    <Layout>
      <div class="row">
        <div class="col-12">
          <div className="d-flex justify-content-center">
            <h2>Account Verified</h2>
          </div>
          <p>Your account has been verified.</p>
        </div>
      </div>
    </Layout>,
  );
};
