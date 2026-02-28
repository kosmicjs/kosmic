import type {Middleware} from '@kosmic/server';
import type {JSX} from 'preact';

export const get: Middleware = async (ctx) => {
  if (!ctx.request.params?.partial) {
    ctx.throw(404, 'Not Found');
  }

  ctx.log.debug(`Rendering partial "${ctx.request.params?.partial}"`);

  const {default: Modal} = (await import(
    /* @vite-ignore */
    `../../components/partials/${ctx.request.params?.partial}.js`
  )) as {default: () => JSX.Element};

  await ctx.render(<Modal />);
};
