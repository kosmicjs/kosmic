import '@popperjs/core';
import {Tooltip} from 'bootstrap';
import {$$} from './query.js';

export function initializeTooltips($el: Element) {
  const $tooltips = $$('[data-bs-toggle="tooltip"]', $el);

  for (const $el of $tooltips) {
    // eslint-disable-next-line no-new
    new Tooltip($el);
  }
}
