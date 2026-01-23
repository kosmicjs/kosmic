import type {Context, Next} from 'koa';
import {renderToStringAsync} from 'preact-render-to-string';
import {type VNode} from 'preact';

declare module 'koa' {
  /**
   * render a jsx component template
   */
  type Render = (component: VNode) => Promise<void>;

  interface DefaultContext {
    render: Render;
  }
  /**
   * render a jsx component template
   */
  interface Response {
    render: Render;
  }
}

export async function renderMiddleware(context: Context, next: Next) {
  context.render = async (component: VNode) => {
    context.type = 'text/html';
    context.body = `<!DOCTYPE html>` + (await renderToStringAsync(component));
  };

  context.response.render = context.render;
  await next();
}
