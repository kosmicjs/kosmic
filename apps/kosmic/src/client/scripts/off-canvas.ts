import '@popperjs/core';
import {Offcanvas} from 'bootstrap';
import {$$} from './query.ts';

export function initializeOffcanvas($element: Element) {
  const offcanvasElementList = $$('.offcanvas', $element);
  for (const offcanvasElement of offcanvasElementList) {
    // eslint-disable-next-line no-new
    new Offcanvas(offcanvasElement);
  }
}
