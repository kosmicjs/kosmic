import type {Middleware} from 'koa';
import DocsLayout from '#components/docs/docs-layout.js';
import CodeBlock from '#components/code-block.js';

export const get: Middleware = async (ctx) => {
  await ctx.render(
    <DocsLayout>
      <h2 class="my-5">
        <CodeBlock language="bash" code="npm run dev" />
      </h2>
      <p>
        This command will start the development server through vite. The
        development server will automatically restart when you make changes to
        your files.
      </p>
      <h2 class="my-5">
        <CodeBlock code="npm run build" />
      </h2>
      <p>
        This command will build your application for production. It will output
        your application to the <code>dist</code> directory.
      </p>
      <h2 class="my-5">
        <CodeBlock code="npm run start" />
      </h2>
      <p>
        This command will start your application in production mode. It will
        serve your application from the <code>dist</code> directory.
      </p>
      <h2 class="my-5">
        <CodeBlock code="npm run migrate" />
      </h2>
      <p>
        This command will start your application in production mode. It will
        serve your application from the <code>dist</code> directory.
      </p>
    </DocsLayout>,
  );
};
