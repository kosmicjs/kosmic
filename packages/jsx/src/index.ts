import type {Context, Next} from 'koa';
import {renderToStringAsync} from 'preact-render-to-string';
import type {VNode} from 'preact';

declare module 'koa' {
  /**
   * render a jsx component template
   */
  type Render = (component: VNode) => Promise<void>;
  type PartialRender = (component: VNode) => Promise<void>;

  interface DefaultContext {
    /**
     * Render jsx and set the response body to the rendered HTML.
     * This is intended for rendering full pages with a layout.
     */
    render: Render;
    /**
     * Render jsx and set the response body to the rendered HTML.
     * This is intended for rendering partial page parts.
     */
    partial: PartialRender;
  }
  interface Response {
    /**
     * Render jsx and set the response body to the rendered HTML.
     * This is intended for rendering full pages with a layout.
     */
    render: Render;
    /**
     * Render jsx and set the response body to the rendered HTML.
     * This is intended for rendering partial page parts.
     */
    partial: PartialRender;
  }
}

export async function renderMiddleware(context: Context, next: Next) {
  context.render = async (component: VNode) => {
    context.type = 'text/html';
    context.body = `<!DOCTYPE html>` + (await renderToStringAsync(component));
  };

  context.partial = async (component: VNode) => {
    context.type = 'text/html';
    context.body = await renderToStringAsync(component);
  };

  context.response.render = context.render;
  context.response.partial = context.partial;
  await next();
}
