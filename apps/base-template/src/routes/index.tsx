import type {Context, Next} from '@kosmic/server';
import Layout from '#components/layout.js';
import {CounterIsland} from '#islands/counter.js';

export const get = async (ctx: Context, next: Next) => {
  return ctx.render(
    <Layout title="Kosmic">
      <main className="home">
        <div className="hero">
          <img className="logo" src="/favicon-32x32.png" alt="Kosmic logo" />
          <div className="hero-copy">
            <h1>Welcome to Kosmic</h1>
            <p>
              A minimal server-rendered starter with islands and fast routing.
            </p>
            <div className="hero-actions">
              <CounterIsland initialCount={0} />
            </div>
          </div>
        </div>
      </main>
    </Layout>,
  );
};
