import type {ComponentChildren} from 'preact';
import {getCtx} from '@kosmic/server';
import Footer from './footer.tsx';
import Header from './header.tsx';
import Modal from './modal.tsx';
import Toast from './toast.tsx';
import {config} from '#config/index.js';

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
        <meta charset="utf8" />
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
      <body
        data-bs-theme={ctx.cookies?.get('kosmic-color-mode') ?? 'dark'}
        hx-boost="true"
      >
        <div
          class="progress nav-progress w-100"
          role="progressbar"
          aria-label="Basic example"
          aria-valuenow={0}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div class="progress-bar progress-bar-animated bg-primary" />
        </div>
        <div class="container-fluid">
          <Header />
          {sessionMessages.map((message) => (
            <Toast show isSuccess={message.trim() === 'Logged in'}>
              {message}
            </Toast>
          ))}
          <main class="min-vh-100">{children}</main>
          <Footer />
          <Modal />
        </div>
      </body>
    </html>
  );
}

export default Layout;
