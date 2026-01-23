import type {Middleware} from 'koa';
import DocsLayout from '#components/docs/docs-layout.js';
import CodeBlock from '#components/code-block.js';

export const get: Middleware = async (ctx) => {
  await ctx.render(
    <DocsLayout>
      <p>
        To get started, install Kosmic by running the following command in your
        terminal:
      </p>
      <CodeBlock code="npm install @kosmic/core" />
    </DocsLayout>,
  );
};
