import {$} from './query.js';

let timeout: NodeJS.Timeout;

export function initializeProgressBar($content: Element) {
  $content.on('htmx:beforeSend', () => {
    $('.progress-bar')?.classList.add('w-50');
  });

  $content.on('htmx:xhr:progress', (event) => {
    if (event.detail.lengthComputable) {
      const value = (event.detail.loaded / event.detail.total) * 100;
      if (value > 50) {
        const $progressBar = $('.progress-bar');
        $progressBar?.classList.remove('w-50');
      }
    }
  });

  $content.on('htmx:afterSettle', () => {
    const $progressBar = $('.progress-bar');
    $progressBar?.classList.add('w-100');
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      $progressBar?.classList.remove('w-100');
      $progressBar?.classList.remove('w-50');
    }, 200);
  });

  $content.on('hidden.bs.modal', () => {
    const $progressBar = $('.progress-bar');
    $progressBar?.classList.remove('w-100');
    $progressBar?.classList.remove('w-50');
  });
}
