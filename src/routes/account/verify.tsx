import {type Middleware} from 'koa';
import Layout from '#components/layout.js';

export const get: Middleware = async (ctx, next) => {
  if (!ctx.state.user) {
    throw new Error('Unauthorized');
  }

  ctx.log.debug({user: ctx.state.user}, 'verifying user...');

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
