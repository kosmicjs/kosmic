import {$$} from './query.js';
import {getCookie, setCookie} from './cookies.js';

// Cookie name for color mode
const COLOR_MODE_COOKIE = 'kosmic-color-mode';

export const initializeColorModeSwitch = ($content: Element) => {
  const [$switch] = $$('#color-mode-switch', $content);
  const [$body] = $$('body');

  if (
    !($switch instanceof HTMLInputElement) ||
    !($body instanceof HTMLElement)
  ) {
    return;
  }

  // Initialize from cookie or system preference
  const savedMode = getCookie(COLOR_MODE_COOKIE);

  if (savedMode) {
    // Apply saved mode
    $body.dataset.bsTheme = savedMode;
    // Update switch state (checked for light mode)
    $switch.checked = savedMode === 'light';
  } else {
    // No saved preference - check if we should use system preference
    const prefersDark = globalThis.matchMedia(
      '(prefers-color-scheme: dark)',
    ).matches;
    const initialMode = prefersDark ? 'dark' : 'light';
    $body.dataset.bsTheme = initialMode;
    $switch.checked = initialMode === 'light';
    setCookie(COLOR_MODE_COOKIE, initialMode);
  }

  // Handle switch changes
  $switch.on('change', function (ev) {
    if (ev.target instanceof HTMLInputElement) {
      const newMode = ev.target.checked ? 'light' : 'dark';
      $body.dataset.bsTheme = newMode;
      setCookie(COLOR_MODE_COOKIE, newMode);
    }
  });
};
