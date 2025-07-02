import fs from 'node:fs';
import {type VNode} from 'preact';
import juice from 'juice';
import {renderToString as preactRenderToString} from 'preact-render-to-string';

// Helper function to render an email template to a string with inlined styles
export async function renderToString(emailComponent: VNode): Promise<string> {
  const rawHtml = preactRenderToString(emailComponent);

  // Read the CSS file from the filesystem in node_modules/bootstrap/dist/css/bootstrap.min.css
  // this needs to be done from the dist folder
  const cssFilePath = new URL(
    '../../../../node_modules/bootstrap/dist/css/bootstrap.min.css',
    import.meta.url,
  );
  const css = await fs.promises.readFile(cssFilePath, 'utf8');
  return juice(rawHtml, {extraCss: css});
}
