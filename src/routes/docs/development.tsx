import {type Middleware} from 'koa';
import DocsLayout from '#components/docs/docs-layout.js';
import CodeBlock from '#components/code-block.js';

export const get: Middleware = async (ctx) => {
  await ctx.render(
    <DocsLayout>
      <h1 className="mb-4">Development Guide</h1>

      <section className="mb-5">
        <h2>How It Works</h2>
        <p>
          Kosmic aims to provide a first-class developer experience with modern
          development features. These features include live reloading and hot
          reloading all code where possible. Under the hood, Kosmic heavily
          relies on Vite to power the dev experience.
        </p>
      </section>

      <section className="mb-5">
        <h2>Development Server</h2>
        <p>To start the development server, run:</p>
        <CodeBlock code="npm run dev" />
        <p>
          This will start the server with hot module reloading enabled, allowing
          you to:
        </p>
        <ul>
          <li>Edit server-side code with automatic restarts</li>
          <li>Modify JSX components with instant UI updates</li>
          <li>
            Work with client-side scripts that reload without a full page
            refresh
          </li>
          <li>See CSS changes immediately reflected in the browser</li>
        </ul>
      </section>

      <section className="mb-5">
        <h2>File System Based Routing</h2>
        <p>
          Kosmic uses a file system based routing system similar to Next.js.
          Routes are defined by files in the <code>src/routes</code> directory:
        </p>
        <ul>
          <li>
            <code>src/routes/index.tsx</code> → <code>/</code>
          </li>
          <li>
            <code>src/routes/about.tsx</code> → <code>/about</code>
          </li>
          <li>
            <code>src/routes/posts/[id].tsx</code> → <code>/posts/:id</code>
          </li>
        </ul>
        <p>HTTP methods are exported from each route file:</p>
        <CodeBlock
          isMultiline
          language="typescript"
          code={`export const get = async (ctx) => { /* handle GET */ }
                export const post = async (ctx) => { /* handle POST */ }
                export const del = async (ctx) => { /* handle DELETE */ }
              `}
        ></CodeBlock>
      </section>

      <section className="mb-5">
        <h2>TypeScript Support</h2>
        <p>
          Kosmic is built with TypeScript and provides end-to-end type safety
          throughout your application:
        </p>
        <ul>
          <li>Type-safe database queries with Kysely</li>
          <li>Type-checked JSX templates</li>
          <li>Type-safe route handlers with Koa types</li>
          <li>Auto-completion and error checking in your IDE</li>
        </ul>
      </section>

      <section className="mb-5">
        <h2>Working with Databases</h2>
        <p>
          Kosmic uses PostgreSQL with the Kysely query builder. During
          development:
        </p>
        <ul>
          <li>Migrations are automatically applied when the server starts</li>
          <li>
            Database schema changes can be made by creating new migration files
          </li>
          <li>
            You can run <code>npm run migrate:make [name]</code> to create a new
            migration
          </li>
        </ul>
      </section>

      <section className="mb-5">
        <h2>Client-Side Development</h2>
        <p>
          For front-end interactivity, Kosmic uses HTMX with minimal JavaScript:
        </p>
        <ul>
          <li>Add HTMX attributes to your JSX elements for dynamic behavior</li>
          <li>Create interactive UIs without writing custom JavaScript</li>
          <li>For more complex needs, add client-side islands using Preact</li>
        </ul>
        <p>
          Client-side scripts are processed through Vite&apos;s bundler with hot
          module replacement.
        </p>
      </section>

      <section className="mb-5">
        <h2>Testing</h2>
        <p>Kosmic supports testing through Vitest:</p>
        <CodeBlock language="shell" code="npm run test" />
        <p>For test-driven development, run tests in watch mode:</p>
        <CodeBlock language="shell" code="npm run test:watch" />
      </section>

      <section>
        <h2>Environment Configuration</h2>
        <p>
          Environment variables can be set in a <code>.env</code> file at the
          project root. During development, you can use{' '}
          <code>.env.development</code> for development-specific settings.
        </p>
        <p>
          See the <a href="/docs/configuration">Configuration guide</a> for more
          details on available options.
        </p>
      </section>
    </DocsLayout>,
  );
};
