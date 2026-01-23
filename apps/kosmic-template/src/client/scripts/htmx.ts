import _htmx from 'htmx.org';
import {initializeTooltips} from './tooltips.js';
import {initializeCodeCopy} from './copy.js';
import {initializeIslands} from './islands.js';
import {initializeProgressBar} from './progress-bar.js';
import {initializeOffcanvas} from './off-canvas.js';

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
