import {type Middleware} from 'koa';
import {type VNode} from 'preact';
import {renderToStringAsync} from 'preact-render-to-string';
import pretty from 'pretty';
import got from 'got';
import {purgeCSSPlugin} from '@fullhuman/postcss-purgecss';
import * as cheerio from 'cheerio';
import postcss from 'postcss';
import cssVariables from 'postcss-css-variables';
import juice from 'juice';
import Layout from '#components/layout.js';
import {EmailPreviewIsland} from '#islands/email-preview.js';
import {config} from '#config/index.js';

export const get: Middleware = async (ctx) => {
  const {email: emailPath} = ctx.params ?? {};

  if (!emailPath) {
    ctx.log.error('Email template parameter is missing');
    ctx.throw(400, 'Email template parameter is required');
    return;
  }

  // convert to try/catch to handle import errors
  const {default: emailComponent} = (await import(
    `../../../emails/${emailPath}.js`
  )) as {default: (props: Record<string, unknown>) => VNode};

  const emailHtml = await renderToStringAsync(emailComponent({}));

  let emailCss = '';

  if (config.nodeEnv === 'development') {
    ctx.log.info(`Rendered email template: ${emailPath}`);
    const {body: cssModuleSource} = await got(
      'http://localhost:5173/styles/styles.scss',
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, cssWithExtras] = cssModuleSource.split('__vite__css = ');
    const [css] = cssWithExtras.split('__vite__updateStyle');

    // remove newlines and beginning and ending quotes
    emailCss = css
      .replaceAll(String.raw`\n`, '')
      .trim()
      .slice(1)
      .slice(0, -1);
  }

  const purgedCss = await postcss([
    cssVariables(),
    purgeCSSPlugin({
      content: [{raw: emailHtml, extension: 'html'}],
      variables: true,
      fontFace: true,
      keyframes: true,
    }),
  ]).process(emailCss, {
    from: undefined,
  });

  const $emailHtml = cheerio.load(emailHtml);

  juice.inlineDocument($emailHtml, purgedCss.css);

  await ctx.render(
    <Layout>
      <EmailPreviewIsland html={pretty($emailHtml.html())} />
    </Layout>,
  );
};
