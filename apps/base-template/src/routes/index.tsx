import type {Context, Next} from '@kosmic/server/v2';
import Layout from '#components/layout.js';
import {CounterIsland} from '#islands/counter.js';

export const get = async (ctx: Context, next: Next) => {
  return ctx.render(
    <Layout title="Kosmic Base Template">
      <main className="home">
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">Welcome to Kosmic</span>
            <h1>Launch fast with a beautiful starter template.</h1>
            <p>
              Kosmic gives you server-rendered pages, islands for interactive
              UI, and a clean design system that makes your app feel polished
              from day one.
            </p>
            <div className="hero-actions">
              <a className="button primary" href="#features">
                Explore the template
              </a>
              <a className="button secondary" href="/docs">
                Read docs
              </a>
            </div>
          </div>

          <aside className="hero-panel">
            <div className="panel-card">
              <h2>Live component</h2>
              <p>Interact with the island below to see Kosmic in action.</p>
              <div className="counter-shell">
                <CounterIsland initialCount={5} />
              </div>
            </div>
          </aside>
        </section>

        <section className="features" id="features">
          <article className="feature-card">
            <h3>Server-first routes</h3>
            <p>
              Build pages with first-class server handlers, fast rendering, and
              clean request context.
            </p>
          </article>
          <article className="feature-card">
            <h3>Interactive islands</h3>
            <p>
              Add targeted interactivity where you need it, without shipping a
              full client bundle.
            </p>
          </article>
          <article className="feature-card">
            <h3>Minimal setup</h3>
            <p>
              Start with a thoughtful foundation that includes routing, styling,
              and a modern development workflow.
            </p>
          </article>
        </section>
      </main>
    </Layout>,
  );
};
