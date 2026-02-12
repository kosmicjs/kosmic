/**
 * For convenience we add this small helper script which adds a global
 * on() function to the Node prototype. This allows us to add event listeners
 * to nodes and delegate to a selector jQuery style.
 *
 * This file also exports some handy shortcuts for document.querySelector which
 * feel nice and less verbose to use.
 */

declare global {
  interface Node {
    /**
     * Add event listener to a node and delegate to a selector jQuery style
     *
     * @param {string} name - Event name
     * @param {string} selector - optional CSS selector
     * @param {function} fn - Callback function
     */
    on(
      name: string,
      selector: string | ((...args: any) => unknown),
      fn?: (...args: any) => unknown,
    ): void;
  }
}

Node.prototype.on = function (name: string, selector, fn) {
  if (typeof selector === 'function') {
    this.addEventListener(name, selector);
    return;
  }

  this.addEventListener(name, function (event: Event) {
    if (
      fn &&
      selector &&
      event.target instanceof Element &&
      event.target?.matches(selector)
    ) {
      // eslint-disable-next-line prefer-rest-params
      return fn.apply(event.target, [...arguments]);
    }
  });
};

/**
 * An alias for document.querySelector
 */
export const $ = (s: string, c?: Element) =>
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  (c ?? document).querySelector.bind(document ?? c)(s);
/**
 * An alias for document.querySelectorAll
 */
export const $$ = (s: string, c?: Element) =>
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  (c ?? document).querySelectorAll.bind(c ?? document)(s);

export const isHtmlElement = (el: Element): el is HTMLElement => {
  return el instanceof HTMLElement;
};
