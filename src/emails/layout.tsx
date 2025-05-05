import {type VNode, type ComponentChildren} from 'preact';
import juice from 'juice';
import {renderToString} from 'preact-render-to-string';

export type EmailLayoutProps = {
  readonly children: ComponentChildren;
  readonly title?: string;
  readonly previewText?: string;
  readonly headerText?: string;
  readonly footerText?: string;
  readonly primaryColor?: string;
};

export default function EmailLayout({
  children,
  title = 'Kosmic Notification',
  previewText = 'This is an email from Kosmic',
  headerText = 'Kosmic',
  footerText = '© Kosmic Team',
  primaryColor = '#ffc107', // Bootstrap warning color
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
        <style>
          {`
            body {
              margin: 0;
              padding: 0;
              width: 100% !important;
              background-color: #f8f9fa;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: ${primaryColor};
              padding: 20px;
              text-align: center;
              font-weight: bold;
              font-size: 24px;
              border-top-left-radius: 4px;
              border-top-right-radius: 4px;
            }
            .content {
              background-color: #ffffff;
              padding: 20px;
              border-left: 1px solid #e9ecef;
              border-right: 1px solid #e9ecef;
            }
            .footer {
              background-color: #f8f9fa;
              padding: 15px;
              text-align: center;
              font-size: 12px;
              color: #6c757d;
              border-bottom-left-radius: 4px;
              border-bottom-right-radius: 4px;
              border: 1px solid #e9ecef;
            }
            .btn-primary {
              background-color: ${primaryColor};
              color: #212529;
              border-color: ${primaryColor};
            }
            .preheader {
              display: none;
              max-height: 0;
              overflow: hidden;
              font-size: 1px;
              line-height: 1px;
              color: #ffffff;
            }
            /* Override Bootstrap's media queries that break in email clients */
            .container {
              width: 100% !important;
              max-width: 600px !important;
            }
            /* Fix for Outlook */
            table, td {
              mso-table-lspace: 0pt !important;
              mso-table-rspace: 0pt !important;
            }
            /* Responsive adjustments */
            @media screen and (max-width: 600px) {
              .container {
                width: 100% !important;
                padding: 10px !important;
              }
            }
          `}
        </style>
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

// Helper function to render an email template to a string with inlined styles
export function renderEmailToString(emailComponent: VNode): string {
  const rawHtml = renderToString(emailComponent);
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
