import {hydrate, type VNode} from 'preact';
import camelcase from 'camelcase';
import {$$} from './query.js';
import * as Islands from '#islands/index.js';

declare global {
  interface DOMStringMap {
    island?: string;
    props?: string;
  }
}

/**
 * If you want to use your jsx views as preact components on the front end
 * you can easily implement an islands like architecture with preact.hydrate
 *
 * Simply wrap the component you want to hydate with a div with an id,
 * find the container component and hydrate it on the front-end with preact.hydrate
 *
 * In this way, only the component you want to hydrate will be loaded and re-rendered on the front-end
 *
 * We strongly reccomend you only reach for this as a last resort when htmx is not enough
 * for client side interactions. If you start reaching for this too much, you should consider
 * using a more robust front-end metaframework like next or remix.
 */
export function initializeIslands($content: Element) {
  const $islands = $$('[data-island]', $content);

  for (const $island of $islands) {
    if (!($island instanceof HTMLElement)) continue;

    const islandName = camelcase($island.dataset.island ?? '', {
      pascalCase: true,
    });

    const Component: (props: any) => VNode | Promise<VNode> =
      Islands[islandName as keyof typeof Islands];

    if (Component) {
      $island.setAttribute('hx-boost', 'false');
      let hydrationData: Record<string, unknown> = {};
      if ($island.dataset.props) {
        try {
          hydrationData = JSON.parse($island.dataset.props ?? '') as Record<
            string,
            unknown
          >;
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(error);
        }
      }

      hydrate(<Component {...hydrationData} />, $island);
    }
  }
}
