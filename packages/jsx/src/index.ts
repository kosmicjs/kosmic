import type {Context, Next} from 'koa';
import {renderToStringAsync} from 'preact-render-to-string';
import type {VNode} from 'preact';

/**
 * render a jsx component template
 */
export type Render = (component: VNode) => Promise<void>;
export type PartialRender = (component: VNode) => Promise<void>;

declare module 'koa' {
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
