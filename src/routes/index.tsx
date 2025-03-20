import {type Middleware} from 'koa';
import Counter from '#components/islands/counter.js';
import Layout from '#components/layout.js';

declare module 'koa-session' {
  interface Session {
    messages: string[];
  }
}

export const get: Middleware = async function (ctx) {
  // const messages = ctx.session?.messages ?? [];

  // if (ctx.session) {
  //   ctx.session.messages = [];
  //   ctx.session.save();
  // }

  await ctx.render(
    <Layout>
      {/* <div class="toast-container text-center d-flex align-items-center justify-content-center margin-bottom-5 w-100 pt-5 px-5 position-relative">
        <div
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          class={clsx(`toast border-danger w-100 w-md-75 position-absolute`, {
            show: messages.length > 0,
          })}
        >
          <div class="toast-header border-danger-subtle bg-dark-subtle">
            <strong class="m-auto">Oops!:</strong>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="toast"
            ></button>
          </div>
          <div class="toast-body bg-dark">
            {messages.map((message: string) => (
              <p>{message}</p>
            ))}
          </div>
        </div>
      </div> */}

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
        <p class="text-secondary text-bg-warning text-center p-2 text-center">
          Simple abstractions, deep code insight, fast development.!
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

      <div class="border rounded border-warning p-2 mt-2">
        <div class="p-2">
          Hello from Preact! This is a small island of Preact that is hydrated
          and given interactivity on the client side.
        </div>
        <div
          class="p-2"
          data-island="counter"
          data-props={JSON.stringify({initialCount: 2})}
        >
          <Counter {...{initialCount: 2}} />
        </div>
      </div>
    </Layout>,
  );
};
