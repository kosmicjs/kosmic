import type {ComponentChildren} from 'preact';

export type EmailLayoutProps = {
  readonly children: ComponentChildren;
  readonly title?: string;
};

export default function Layout({
  children,
  title = 'Kosmic Notification',
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
        <table class="table-light" width="100%">
          <tr>
            <td align="center">
              <h1>Kosmic</h1>
              <p class="text-secondary text-bg-primary text-center p-2">
                Simple abstractions, deep code insight, fast development
              </p>
            </td>
          </tr>
          <tr>
            <td align="center">{children}</td>
          </tr>
          <tr>
            <td align="center">© Kosmic Team</td>
          </tr>
        </table>
      </body>
    </html>
  );
}
