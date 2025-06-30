import {type Context, type Next} from 'koa';
import DocsLayout from '#components/docs/docs-layout.js';

export const get = async (ctx: Context, next: Next) => {
  await ctx.render(
    <DocsLayout>
      <h2>Client Entry Point</h2>
      <p>
        By default, the client entry point is located at
        <code class="ps-1">src/client/index.tsx</code>. Generally, the entry
        point is just a file that imports other client side scripts.
      </p>
      <h2>Vite</h2>
      <p>The client is bundled by Vite for both dev and production modes.</p>
      <p>
        Optionally, a Kosmic user can choose preact, htmx, or a mixture of both
        for their frontend stack.
      </p>
    </DocsLayout>,
  );
};
