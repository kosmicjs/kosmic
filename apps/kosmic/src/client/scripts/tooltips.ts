import '@popperjs/core';
import {Tooltip} from 'bootstrap';
import {$$} from './query.ts';

export function initializeTooltips($element: Element) {
  const $tooltips = $$('[data-bs-toggle="tooltip"]', $element);

  for (const $element of $tooltips) {
    // eslint-disable-next-line no-new
    new Tooltip($element);
  }
}
