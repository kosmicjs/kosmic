import {type Middleware} from 'koa';
import {type JSX} from 'preact';

declare module 'koa' {
  interface Params {
    /**
     * The partial to render.
     *
     * TODO: validate this string better for security
     */
    partial?: string;
  }
}

export const get: Middleware = async (ctx) => {
  if (!ctx.request.params?.partial) {
    ctx.throw(404, 'Not Found');
  }

  ctx.log.debug(`Rendering partial "${ctx.request.params?.partial}"`);

  const {default: Modal} = (await import(
    /* @vite-ignore */
    `../../components/modals/${ctx.request.params?.partial}.js`
  )) as {default: () => JSX.Element};

  await ctx.render(<Modal />);
};
