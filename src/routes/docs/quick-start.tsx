import {type Middleware} from 'koa';
import DocsLayout from '#components/docs/docs-layout.js';
import CodeBlock from '#components/code-block.js';

export const get: Middleware = async (ctx) => {
  await ctx.render(
    <DocsLayout>
      <h3 class="my-5">Scaffold a Kosmic starter project</h3>
      <p>
        After Installation, you can create a new Kosmic app by running the CLI.
        <CodeBlock language="bash" code="npx kosmic create my-app" />
      </p>
      <p>
        Under the hood, Kosmic is built on top of Koa, a popular web framework.
        Using Koa as the base for Kosmic means you can use any Koa middleware in
        your Kosmic app. Kosmic gets a built in community of battletested
        packages.
      </p>
      <p>
        However, Kosmic provides a lot more than just a simple Koa wrapper.
        Kosmic makes setting up a production ready Koa server a breeze and ships
        a lot of built in and custom functionality designed to make your Koa app
        awesome to work with.
      </p>
      <h3 class="my-5">A guided tour of the app</h3>
      <p>
        First let&apos;s take a look at a file called <code>server.js</code>
      </p>
      <CodeBlock
        isMultiline
        filename="src/server.js"
        code={`
          import url from 'node:url';
          import path from 'node:path';
          import {Kosmic} from '@kosmic';

          const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

          /**
           * Name the directory where your routes are located
           * This is the directory of the filesystem router that Kosmic uses
           */
          const routesDir = path.join(__dirname, 'controllers');

          /**
           * Name the directory where your static files are located
           */
          const staticDir = path.join(__dirname, 'public');

          export const app = new Kosmic()
            .withFsRouter(routesDir)
            .withBodyParser({enableTypes: ['json', 'form', 'text']})
            .withErrorHandler()
            .withStaticFiles(staticDir);

          export const getCtx = () => {
            const ctx = app.currentContext;
            if (!ctx) throw new Error('No context found');
            return ctx;
          };
        `}
      />
      <p>
        The block above imports Kosmic and instantiates the app with the Kosmic
        builder pattern.
      </p>
    </DocsLayout>,
  );
};
