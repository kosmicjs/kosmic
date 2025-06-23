import _htmx from 'htmx.org';
import {Toast} from 'bootstrap';
import {initializeTooltips} from './tooltips.js';
import {initializeCodeCopy} from './copy.js';
import {initializeIslands} from './islands.js';
import {initializeProgressBar} from './progress-bar.js';
import {initializeOffcanvas} from './off-canvas.js';
import {$} from './query.js';

const htmx = _htmx.default; // fix ts types hack

htmx.onLoad(function ($content) {
  if (!($content instanceof Element)) return;
  initializeTooltips($content);
  initializeCodeCopy($content);
  initializeIslands($content);
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

// htmx.on('htmx:afterSwap', function (evt) {
//   // initializeIslands(evt?.detail?.target ?? $('body')!);
// });

htmx.on('htmx:beforeSwap', function (evt) {
  if (
    // this lint rule is incorrectly triggering
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    evt.detail?.xhr?.status.toString().startsWith('5') ||
    evt.detail?.xhr?.status.toString().startsWith('4')
  ) {
    evt.detail.shouldSwap = true;
    const $toast = $('#toast');
    if ($toast) {
      if (evt.detail) evt.detail.shouldSwap = true;
      const toast = new Toast($toast);
      toast.show();
    }
  }
});
