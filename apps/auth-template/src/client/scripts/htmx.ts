import _htmx from 'htmx.org';
import {initializeIslands} from './islands.tsx';

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const htmx = _htmx as unknown as typeof _htmx.default; // fix ts types hack

htmx.onLoad(function ($content) {
  if (!($content instanceof Element)) {
    return;
  }

  initializeIslands($content);
});

declare global {
  interface Event {
    detail?: {
      xhr?: XMLHttpRequest;
      shouldSwap?: boolean;
      isError?: boolean;
      target?: Element;
      swapOverride?: string;
    };
  }
}

htmx.config = {
  ...htmx.config,
  responseHandling: [{code: '.*', swap: true}],
};
