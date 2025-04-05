import {$$} from './query.js';

// Cookie name for color mode
const COLOR_MODE_COOKIE = 'kosmic-color-mode';

// Helper functions for cookie operations
const getCookie = (name: string): string | undefined => {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    if (cookieName === name) {
      return cookieValue;
    }
  }
};

const setCookie = (name: string, value: string, days = 30): void => {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
};

export const initializeColorModeSwitch = ($content: Element) => {
  const [$switch] = $$('#color-mode-switch', $content);
  const [$body] = $$('body');

  if (!($switch instanceof HTMLInputElement) || !($body instanceof HTMLElement))
    return;

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

    // Save the initial mode
    setCookie(COLOR_MODE_COOKIE, initialMode);
  }

  // Handle switch changes
  $switch.on('change', function (ev) {
    if (ev.target instanceof HTMLInputElement) {
      const newMode = ev.target.checked ? 'light' : 'dark';
      $body.dataset.bsTheme = newMode;

      // Save to cookie
      setCookie(COLOR_MODE_COOKIE, newMode);
    }
  });
};
