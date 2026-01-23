import {type Context, type Next} from 'koa';
import DocsLayout from '#components/docs/docs-layout.js';

export const get = async (ctx: Context, next: Next) => {
  await ctx.render(<DocsLayout>DB</DocsLayout>);
};
