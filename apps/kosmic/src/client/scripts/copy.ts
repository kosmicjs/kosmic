import copyToClipboard from 'copy-to-clipboard';
import {Tooltip} from 'bootstrap';
import {$$} from './query.ts';

export function initializeCodeCopy($element: Element) {
  const $code = $$('code', $element);

  for (const $element of $code) {
    if (!($element instanceof HTMLElement)) {
      continue;
    }

    let copiedTimeout: NodeJS.Timeout;
    $element.on('click', () => {
      if (!$element.dataset.code) {
        return;
      }

      if (copiedTimeout) {
        clearTimeout(copiedTimeout);
      }

      copyToClipboard($element.dataset.code?.trim?.()).catch(() => {
        // ignore
      });
      const previousTooltip = Tooltip.getOrCreateInstance($element);
      previousTooltip.dispose();
      const copiedTip = new Tooltip($element, {
        title: 'Copied!',
      });
      copiedTip.show();
      copiedTimeout = setTimeout(() => {
        copiedTip.dispose();
        new Tooltip($element); // eslint-disable-line no-new
      }, 1000);
    });
  }
}
