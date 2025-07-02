import {type VNode} from 'preact';
import juice from 'juice';
import {renderToString as preactRenderToString} from 'preact-render-to-string';

// Helper function to render an email template to a string with inlined styles
export function renderToString(emailComponent: VNode): string {
  const rawHtml = preactRenderToString(emailComponent);
  return juice(rawHtml, {
    removeStyleTags: true,
    preserveMediaQueries: true,
    preserveFontFaces: true,
    applyStyleTags: true,
    insertPreservedExtraCss: true,
    extraCss: '',
    preserveImportant: true,
  });
}
