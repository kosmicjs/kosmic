import type {Context, Next} from 'koa';
import DocsLayout from '#components/docs/docs-layout.js';

export const get = async (ctx: Context, next: Next) => {
  await ctx.render(
    <DocsLayout>
      <h1 className="mb-4">About Kosmic</h1>

      <section className="mb-5">
        <h2>What is Kosmic?</h2>
        <p>
          Kosmic is a modern, full-stack JavaScript/TypeScript web application
          framework built on top of Koa. It provides a production-ready starter
          kit for building robust business applications with deep type safety
          throughout the stack.
        </p>
      </section>

      <section className="mb-5">
        <h2>Key Features</h2>
        <ul className="list-group list-group-flush">
          <li className="list-group-item">
            <strong>Server Framework:</strong> Built on Koa with custom
            middleware for routing, error handling, and authentication
          </li>
          <li className="list-group-item">
            <strong>View Engine:</strong> Uses JSX/Preact for server-side
            rendering with client-side hydration capabilities
          </li>
          <li className="list-group-item">
            <strong>Database:</strong> PostgreSQL with Kysely as a type-safe
            query builder
          </li>
          <li className="list-group-item">
            <strong>Authentication:</strong> Implements Passport.js with local
            and GitHub strategies
          </li>
          <li className="list-group-item">
            <strong>Frontend Interactivity:</strong> HTMX for dynamic
            interactions with minimal JavaScript
          </li>
        </ul>
      </section>

      <section className="mb-5">
        <h2>Philosophy</h2>
        <p>
          Kosmic aims to combine the best of modern web development practices
          while avoiding unnecessary complexity. It follows these core
          principles:
        </p>
        <ul>
          <li>Server-side rendering with progressive enhancement</li>
          <li>Type safety from database to UI</li>
          <li>Minimal client-side JavaScript</li>
          <li>Developer experience that prioritizes productivity</li>
          <li>Convention over configuration without sacrificing flexibility</li>
        </ul>
      </section>

      <section className="mb-5">
        <h2>Getting Started</h2>
        <p>
          Check out our <a href="/docs/getting-started">Getting Started</a>{' '}
          guide to begin building applications with Kosmic. For more detailed
          information, explore the documentation sections in the sidebar.
        </p>
        <div className="mt-4">
          <a href="/docs/quick-start" className="btn btn-primary me-2">
            Quick Start
          </a>
          <a
            href="https://github.com/kosmicjs/kosmic"
            className="btn btn-outline-secondary"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i class="bi bi-github" /> GitHub Repository
          </a>
        </div>
      </section>
    </DocsLayout>,
  );
};
