import type {Context, Next} from '@kosmic/server';
import Layout from '#components/layout.js';

export const get = async (ctx: Context, next: Next) => {
  return ctx.render(
    <Layout>
      <div>TEMPLATE</div>
    </Layout>,
  );
};
