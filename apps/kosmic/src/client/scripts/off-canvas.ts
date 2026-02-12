import '@popperjs/core';
import {Offcanvas} from 'bootstrap';
import {$$} from './query.ts';

export function initializeOffcanvas($el: Element) {
  const offcanvasElementList = $$('.offcanvas', $el);
  for (const offcanvasEl of offcanvasElementList) {
    // eslint-disable-next-line no-new
    new Offcanvas(offcanvasEl);
  }
}
