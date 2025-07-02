import {type ComponentChildren} from 'preact';
import juice from 'juice';
import {renderToString} from 'preact-render-to-string';

export type EmailLayoutProps = {
  readonly children: ComponentChildren;
  readonly title?: string;
  readonly previewText?: string;
  readonly headerText?: string;
  readonly footerText?: string;
};

export default function Layout({
  children,
  title = 'Kosmic Notification',
  previewText = 'This is an email from Kosmic',
  headerText = 'Kosmic',
  footerText = '© Kosmic Team',
}: EmailLayoutProps) {
  // Create the email component
  const emailComponent = (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="preheader">{previewText}</div>
        <table width="100%" cellPadding="0" cellSpacing="0">
          <tr>
            <td align="center" valign="top">
              <table
                className="container"
                width="600"
                cellPadding="0"
                cellSpacing="0"
              >
                <tr>
                  <td className="header">{headerText}</td>
                </tr>
                <tr>
                  <td className="content">{children}</td>
                </tr>
                <tr>
                  <td className="footer">{footerText}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  );

  // Render to string and apply juice to inline styles
  const rawHtml = renderToString(emailComponent);
  const inlinedHtml = juice(rawHtml, {
    removeStyleTags: true,
    preserveMediaQueries: true,
    preserveFontFaces: true,
    applyStyleTags: true,
    insertPreservedExtraCss: true,
    extraCss: '',
    preserveImportant: true,
  });

  // Return the inlined HTML
  // eslint-disable-next-line react/no-danger
  return <div dangerouslySetInnerHTML={{__html: inlinedHtml}} />;
}
