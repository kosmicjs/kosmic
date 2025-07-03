import {type Middleware} from 'koa';
import {CounterIsland} from '#islands/counter.js';
import Layout from '#components/layout.js';

declare module 'koa-session' {
  interface Session {
    messages: string[];
  }
}

export const get: Middleware = async function (ctx) {
  await ctx.render(
    <Layout>
      <div class="d-flex flex-column align-items-center mb-5">
        {['Koa', 'HTMX', 'Postgres'].map((tech, idx) => (
          <>
            <span class="h3 text-bg-info text-center p-2">{tech}</span>
            {idx === 2 ? null : <span class="h4 text-center">+</span>}
          </>
        ))}
      </div>

      <div class="d-flex flex-column align-items-center mb-5">
        <h1>Kosmic</h1>
        <p class="text-secondary text-bg-primary text-center p-2 text-center">
          Simple abstractions, deep code insight, fast development!!!!!
        </p>
      </div>

      <div class="d-flex flex-column align-items-center mb-5">
        {['TypeScript', 'Preact', 'Vite', 'Kysely'].map((tech, idx) => (
          <>
            <span class="h3 text-bg-info text-center p-2">{tech}</span>
            {idx === 3 ? null : <span class="h4 text-center">+</span>}
          </>
        ))}
      </div>

      <div class="border rounded border-primary p-2 mt-2">
        <div class="p-2">
          Hello from Preact! This is a small island of Preact that is hydrated
          and given interactivity on the client side.
        </div>

        <CounterIsland {...{initialCount: 2}} />
      </div>
    </Layout>,
  );
};
