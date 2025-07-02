import {type ComponentChildren} from 'preact';

export type EmailLayoutProps = {
  readonly children: ComponentChildren;
  readonly title?: string;
  readonly headerText?: string;
  readonly footerText?: string;
};

export default function Layout({
  children,
  title = 'Kosmic Notification',
  headerText = 'Kosmic',
  footerText = '© Kosmic Team',
}: EmailLayoutProps) {
  // Create the email component
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
      </head>
      <body>
        <table class="table">
          <tr>
            <td class="header">{headerText}</td>
          </tr>
          <tr>
            <td class="content">{children}</td>
          </tr>
          <tr>
            <td class="footer">{footerText}</td>
          </tr>
        </table>
      </body>
    </html>
  );
}
