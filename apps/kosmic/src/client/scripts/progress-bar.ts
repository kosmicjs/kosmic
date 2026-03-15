import {$} from './query.ts';

let timeout: NodeJS.Timeout;

type ProgressDetail = {
  lengthComputable: boolean;
  loaded: number;
  total: number;
};

function isProgressDetail(value: unknown): value is ProgressDetail {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  if (
    !('lengthComputable' in value) ||
    !('loaded' in value) ||
    !('total' in value)
  ) {
    return false;
  }

  return (
    typeof value.lengthComputable === 'boolean' &&
    typeof value.loaded === 'number' &&
    typeof value.total === 'number'
  );
}

export function initializeProgressBar($content: Element) {
  $content.on('htmx:beforeSend', () => {
    $('.progress-bar')?.classList.add('w-50');
  });

  $content.on('htmx:xhr:progress', (event) => {
    if (!(event instanceof CustomEvent) || !isProgressDetail(event.detail)) {
      return;
    }

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
      $progressBar?.classList.remove('w-100', 'w-50');
    }, 200);
  });

  $content.on('hidden.bs.modal', () => {
    const $progressBar = $('.progress-bar');
    $progressBar?.classList.remove('w-100', 'w-50');
  });
}
