import copyToClipboard from 'copy-to-clipboard';
import {Tooltip} from 'bootstrap';
import {$$} from './query.ts';

export function initializeCodeCopy($element: Element) {
  const $code = $$('code', $element);

  for (const $codeElement of $code) {
    if (!($codeElement instanceof HTMLElement)) {
      continue;
    }

    let copiedTimeout: NodeJS.Timeout;
    $codeElement.on('click', () => {
      if (!$codeElement.dataset.code) {
        return;
      }

      if (copiedTimeout) {
        clearTimeout(copiedTimeout);
      }

      copyToClipboard($codeElement.dataset.code?.trim?.()).catch(() => {
        // ignore
      });
      const previousTooltip = Tooltip.getOrCreateInstance($codeElement);
      previousTooltip.dispose();
      const copiedTip = new Tooltip($codeElement, {
        title: 'Copied!',
      });
      copiedTip.show();
      copiedTimeout = setTimeout(() => {
        copiedTip.dispose();
        new Tooltip($codeElement); // eslint-disable-line no-new
      }, 1000);
    });
  }
}
