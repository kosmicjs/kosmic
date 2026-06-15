import type {ComponentChildren} from 'preact';
import {getCtx} from '@kosmic/server';
import {config} from '@kosmic/config';

export type Props = {
  readonly children: ComponentChildren;
  readonly title?: string;
  readonly env?: string;
  readonly ctx?: ReturnType<typeof getCtx>;
  readonly scripts?: Array<{
    readonly src: string;
    readonly type?: string;
  }>;
};

function Css({files}: {readonly files?: string[] | undefined}) {
  if (!files) return null;
  return (
    <>
      {files.map((fileName) => (
        <link key={fileName} rel="stylesheet" href={`/${fileName}`} />
      ))}
    </>
  );
}

function Script({file}: {readonly file?: string | undefined}) {
  if (!file) return null;
  return <script type="module" src={`/${file}`} />;
}

export function Layout({
  children,
  title,
  scripts,
  env = config.nodeEnv ?? 'development',
  ctx = getCtx(),
}: Props) {
  const foundManifest = ctx.state.manifest?.['scripts/index.ts'];

  const sessionMessages = ctx.session?.messages ?? [];

  scripts ??= [];

  if (ctx.session && sessionMessages.length > 0) {
    ctx.session.messages = [];
  }

  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="X-UA-Compatible" content="ie=edge" />
        <title>{title}</title>
        <link rel="manifest" href="/site.webmanifest" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        {env === 'production' ? (
          <>
            <Script file={foundManifest?.file} />
            <Css files={foundManifest?.css} />
          </>
        ) : (
          <>
            <script type="module" src="http://localhost:5173/@vite/client" />
            <script
              type="module"
              src="http://localhost:5173/scripts/index.ts"
            />
            {scripts.map(({src}) => (
              <script type="module" src={`http://localhost:5173/${src}`} />
            ))}
          </>
        )}
      </head>
      <body hx-boost="true">
        <div class="container-fluid">{children}</div>
      </body>
    </html>
  );
}

export default Layout;
