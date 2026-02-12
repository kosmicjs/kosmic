import _htmx from 'htmx.org';
import {initializeTooltips} from './tooltips.ts';
import {initializeCodeCopy} from './copy.ts';
import {initializeIslands} from './islands.tsx';
import {initializeProgressBar} from './progress-bar.ts';
import {initializeOffcanvas} from './off-canvas.ts';

const htmx = _htmx as unknown as typeof _htmx.default; // fix ts types hack

htmx.onLoad(function ($content) {
  if (!($content instanceof Element)) {
    return;
  }

  initializeIslands($content);
  initializeTooltips($content);
  initializeCodeCopy($content);
  initializeProgressBar($content);
  initializeOffcanvas($content);
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
